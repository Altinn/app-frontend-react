import { useCallback } from 'react';

import { ContextNotProvided } from 'src/core/contexts/context';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { LayoutPages } from 'src/utils/layout/LayoutPages';
import { NodesReadiness } from 'src/utils/layout/NodesContext';
import type { ParentNode } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesContext, NodesInternal, PageData, PagesData, useNodesLax } from 'src/utils/layout/NodesContext';
import type { NodeData } from 'src/utils/layout/types';

type AnyData = PagesData | PageData | NodeData;
type Node = BaseLayoutNode | LayoutPage | LayoutPages;
type DataFrom<T extends Node> = T extends LayoutPage ? PageData : T extends LayoutPages ? PagesData : NodeData;

export type TraversalRestriction = number | undefined;
export type TraversalMatcher = (state: AnyData) => boolean | undefined;

export class TraversalTask {
  constructor(
    private state: NodesContext,
    private rootNode: LayoutPages,
    public readonly matcher: TraversalMatcher | undefined,
    public readonly restriction: TraversalRestriction | undefined,
  ) {}

  /**
   * Get the node data for a given node
   */
  public getData<T extends Node>(target: T): DataFrom<T> {
    if (target instanceof LayoutPage) {
      return this.state.pagesData.pages[target.pageKey] as DataFrom<T>;
    }

    if (target instanceof LayoutPages) {
      return this.state.pagesData as DataFrom<T>;
    }

    if (this.state.readiness !== NodesReadiness.Ready && this.state.prevNodeData?.[target.id]) {
      return this.state.prevNodeData[target.id] as DataFrom<T>;
    }

    if (!this.state.nodeData[target.id]) {
      throw new Error(`Node data for ${target.id} is missing (when matching/getting data in traversal)`);
    }

    return this.state.nodeData[target.id] as DataFrom<T>;
  }

  /**
   * Get the node object for a given ID
   */
  public getNode(id: string): LayoutNode | undefined {
    return this.rootNode.findById(id);
  }

  /**
   * Filter a node based on the matcher
   */
  public passesMatcher(node: Node): boolean {
    return !this.matcher || this.matcher(this.getData(node)) === true;
  }

  /**
   * Filter a node based on the restriction
   */
  public passesRestriction(node: Node): boolean {
    if (this.restriction !== undefined && node instanceof BaseLayoutNode) {
      return node.rowIndex === this.restriction;
    }

    return true;
  }

  /**
   * Filter a node based on it passing both the matcher and restriction
   */
  public passes(node: Node): boolean {
    return this.passesMatcher(node) && this.passesRestriction(node);
  }

  /**
   * All should pass if there is no matcher or restrictions
   */
  public allPasses(): boolean {
    return !this.matcher && !this.restriction;
  }

  /**
   * Convert this task and add/overwrite a restriction
   */
  public addRestriction(restriction: TraversalRestriction | undefined): TraversalTask {
    return new TraversalTask(this.state, this.rootNode, this.matcher, restriction);
  }
}

export class NodeTraversal<T extends Node = LayoutPages> {
  constructor(
    private readonly state: NodesContext,
    private readonly rootNode: LayoutPages,
    public readonly target: T,
  ) {}

  /**
   * Initialize new traversal with a specific node
   */
  with<N extends Node>(node: N): NodeTraversalFrom<N> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NodeTraversal(this.state, this.rootNode, node) as any;
  }

  /**
   * Looks for a matching component upwards in the hierarchy, returning the first one (or undefined if
   * none can be found).
   */
  closest(matching: TraversalMatcher): LayoutNode | undefined {
    return this.target.closest(new TraversalTask(this.state, this.rootNode, matching, undefined));
  }

  /**
   * Looks for a component with a specific ID upwards in the hierarchy, using the same rules as closest().
   */
  closestId(id: string): LayoutNode | undefined {
    return this.target.closest(
      new TraversalTask(
        this.state,
        this.rootNode,
        (c) => c.type === 'node' && (c.layout.id === id || c.layout.baseComponentId === id),
        undefined,
      ),
    );
  }

  /**
   * Like children(), but will only match upwards along the tree towards the top page (LayoutPage)
   */
  parents(matching?: TraversalMatcher): ParentsFrom<T> {
    const target = this.target;
    if (target instanceof LayoutPages) {
      throw new Error('Cannot call parents() on a LayoutPages object');
    }
    if (target instanceof LayoutPage) {
      throw new Error('Cannot call parents() on a LayoutPage object');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return target.parents(new TraversalTask(this.state, this.rootNode, matching, undefined)) as any;
  }

  /**
   * Looks for a matching component inside the (direct) children of this node (only makes sense for
   * a group/container node).
   *
   * Beware that matching inside a repeating group with multiple rows, you may want to provide a second argument
   * to specify which row to look in, otherwise you will find instances of the component in all rows.
   */
  children(matching?: TraversalMatcher, restriction?: TraversalRestriction): ChildFrom<T>[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.target.children(new TraversalTask(this.state, this.rootNode, matching, restriction)) as any;
  }

  /**
   * This returns all the child nodes (including duplicate components for repeating groups and children of children) as
   * a flat list of LayoutNode objects.
   */
  flat(matching?: TraversalMatcher, restriction?: TraversalRestriction): LayoutNode[] {
    return this.target.flat(new TraversalTask(this.state, this.rootNode, matching, restriction));
  }

  /**
   * Selects all nodes in the hierarchy, starting from the root node.
   */
  allNodes(matching?: TraversalMatcher, restriction?: TraversalRestriction): LayoutNode[] {
    return this.rootNode.allNodes(new TraversalTask(this.state, this.rootNode, matching, restriction));
  }

  /**
   * Find a LayoutPage given a page key
   */
  findPage(pageKey: string | undefined): LayoutPage | undefined {
    if (!pageKey) {
      return undefined;
    }

    return this.rootNode.findLayout(new TraversalTask(this.state, this.rootNode, undefined, undefined), pageKey);
  }

  /**
   * Find a node (never a page) by the given ID
   */
  findById(id: string | undefined): LayoutNode | undefined {
    if (this.target instanceof BaseLayoutNode) {
      throw new Error('Cannot call findById() on a LayoutNode object');
    }

    return this.rootNode.findById(id);
  }
}

type ParentsFrom<N extends Node> = N extends LayoutPages
  ? never[]
  : N extends LayoutPage
    ? never[]
    : N extends LayoutNode
      ? ParentNode[]
      : never[];

type ChildFrom<N extends Node> = N extends LayoutPages
  ? LayoutPage
  : N extends LayoutPage
    ? LayoutNode
    : N extends LayoutNode
      ? LayoutNode
      : never;

export type NodeTraversalFrom<N extends Node> = N extends LayoutPages
  ? NodeTraversalFromRoot
  : N extends LayoutPage
    ? NodeTraversalFromPage
    : N extends LayoutNode
      ? NodeTraversalFromNode<N>
      : never;

export type NodeTraversalFromRoot = Omit<NodeTraversal, 'parents'>;
export type NodeTraversalFromPage = Omit<NodeTraversal<LayoutPage>, 'allNodes' | 'findPage'>;
export type NodeTraversalFromNode<N extends LayoutNode> = Omit<NodeTraversal<N>, 'allNodes' | 'findPage' | 'findById'>;

enum Strictness {
  // If the context or nodes are not provided, throw an error upon traversal
  throwError,

  // If the context or nodes are not provided, return ContextNotProvided upon traversal
  returnContextNotProvided,
}

type InnerSelectorReturns<Strict extends Strictness, U> = Strict extends Strictness.returnContextNotProvided
  ? U | typeof ContextNotProvided
  : U;

function throwOrReturn<R>(value: R, strictness: Strictness) {
  if (value === ContextNotProvided) {
    if (strictness === Strictness.throwError) {
      throw new Error('useNodeTraversalSelector() must be used inside a NodesProvider');
    }
    if (strictness === Strictness.returnContextNotProvided) {
      return ContextNotProvided;
    }
    return undefined;
  }

  return value;
}

function useInnerNodeTraversalSelectorProto<Strict extends Strictness>(
  strictness: Strict,
  nodes: ReturnType<typeof useNodesLax>,
  nodeDataSelectorForTraversal: ReturnType<typeof NodesInternal.useDataSelectorForTraversal>,
) {
  return useCallback(
    <U>(
      innerSelector: (traverser: NodeTraversalFromRoot) => InnerSelectorReturns<Strict, U>,
      deps: unknown[],
    ): InnerSelectorReturns<Strict, U> => {
      if (!nodes) {
        return throwOrReturn(ContextNotProvided, strictness) as InnerSelectorReturns<Strict, U>;
      }

      const value = nodeDataSelectorForTraversal(
        (state) => innerSelector(new NodeTraversal(state, nodes, nodes)) as InnerSelectorReturns<Strict, U>,
        [innerSelector.toString(), ...deps],
      );

      return throwOrReturn(value, strictness) as InnerSelectorReturns<Strict, U>;
    },
    [nodeDataSelectorForTraversal, nodes, strictness],
  );
}

export function useInnerNodeTraversalSelector(
  nodes: ReturnType<typeof useNodesLax>,
  nodeDataSelectorForTraversal: ReturnType<typeof NodesInternal.useDataSelectorForTraversal>,
) {
  return useInnerNodeTraversalSelectorProto(Strictness.throwError, nodes, nodeDataSelectorForTraversal);
}

export type NodeTraversalSelector = <U>(selector: (t: NodeTraversalFromRoot) => U, deps?: unknown[]) => U;
