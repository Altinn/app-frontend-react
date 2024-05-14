import { useCallback } from 'react';

import { ContextNotProvided } from 'src/core/contexts/context';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { LayoutPages } from 'src/utils/layout/LayoutPages';
import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { isNodeRef } from 'src/utils/layout/nodeRef';
import { NodesInternal, pickDataStorePath, useNodesAsLaxRef } from 'src/utils/layout/NodesContext';
import type { NodeRef } from 'src/layout';
import type { ParentNode } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { PageData, PageHierarchy } from 'src/utils/layout/NodesContext';
import type { NodeData } from 'src/utils/layout/types';

type AnyData = PageHierarchy | PageData | NodeData;
type Node = BaseLayoutNode | LayoutPage | LayoutPages;

export interface TraversalRowIndexRestriction {
  onlyInRowIndex: number;
}

export interface TraversalRowUuidRestriction {
  onlyInRowUuid: string;
}

export type TraversalRestriction = TraversalRowUuidRestriction | TraversalRowIndexRestriction;
export type TraversalMatcher = (state: AnyData) => boolean;

const emptyArray: never[] = [];

export class TraversalTask {
  constructor(
    private state: PageHierarchy,
    private rootNode: LayoutPages,
    private readonly matcher: TraversalMatcher | undefined,
    private readonly restriction: TraversalRestriction | undefined,
  ) {}

  /**
   * Get the node data for a given node
   */
  private getData(target: NodeRef | Node): AnyData {
    if (isNodeRef(target)) {
      const node = this.rootNode.findById(this, target.nodeRef);
      if (!node) {
        throw new NodePathNotFound(`Failed to look up nodeRef '${target.nodeRef}'`);
      }

      return pickDataStorePath(this.state, node);
    }

    if (target instanceof LayoutPages) {
      return this.state;
    }

    return pickDataStorePath(this.state, target as LayoutNode | LayoutPage);
  }

  /**
   * Get a node object, given some node data
   */
  private getNode(state: AnyData): LayoutNode | LayoutPage | LayoutPages {
    if (state.type === 'pages') {
      return this.rootNode;
    }

    if (state.type === 'page') {
      return this.rootNode.findLayout(this, state.pageKey)!;
    }

    return this.rootNode.findById(this, state.item.id)!;
  }

  /**
   * Filter a node based on the matcher
   */
  public passesMatcher(node: Node): boolean {
    return !this.matcher || this.matcher(this.getData(node));
  }

  /**
   * Filter a node based on the restriction
   */
  public passesRestriction(node: Node): boolean {
    if (this.restriction && 'onlyInRowIndex' in this.restriction && node instanceof BaseLayoutNode) {
      return node.row?.index === this.restriction.onlyInRowIndex;
    }

    if (this.restriction && 'onlyInRowUuid' in this.restriction && node instanceof BaseLayoutNode) {
      return node.row?.uuid === this.restriction.onlyInRowUuid;
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
    private readonly state: PageHierarchy,
    private readonly rootNode: LayoutPages,
    private readonly target: T,
  ) {}

  /**
   * Initialize new traversal with a specific node
   */
  with<N extends Node>(node: N): NodeTraversalFrom<N> {
    return new NodeTraversal(this.state, this.rootNode, node) as any;
  }

  targetIsRoot(): this is NodeTraversalFromRoot {
    return this.target === this.rootNode;
  }

  /**
   * Looks for a matching component upwards in the hierarchy, returning the first one (or undefined if
   * none can be found).
   */
  closest(matching: TraversalMatcher): LayoutNode | undefined {
    return this.target.closest(new TraversalTask(this.state, this.rootNode, matching, undefined));
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

    return target.parents(new TraversalTask(this.state, this.rootNode, matching, undefined)) as any;
  }

  /**
   * Looks for a matching component inside the (direct) children of this node (only makes sense for
   * a group/container node or a page). This will only return the first match.
   */
  firstChild(matching?: TraversalMatcher, restriction?: TraversalRestriction): ChildFrom<T> | undefined {
    return this.target.firstChild(new TraversalTask(this.state, this.rootNode, matching, restriction)) as any;
  }

  /**
   * Looks for a matching component inside the (direct) children of this node (only makes sense for
   * a group/container node).
   *
   * Beware that matching inside a repeating group with multiple rows, you may want to provide a second argument
   * to specify which row to look in, otherwise you will find instances of the component in all rows.
   */
  children(matching?: TraversalMatcher, restriction?: TraversalRestriction): ChildFrom<T>[] {
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
  allNodes(): LayoutNode[] {
    return this.rootNode.allNodes(new TraversalTask(this.state, this.rootNode, undefined, undefined));
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
   * Find all nodes with a specific ID
   */
  findAllById(idOrRef: string | NodeRef | undefined): LayoutNode[] {
    if ((this.target as any) instanceof BaseLayoutNode) {
      throw new Error('Cannot call findAllById() on a LayoutNode object');
    }

    const id = isNodeRef(idOrRef) ? idOrRef.nodeRef : idOrRef;
    if (!id) {
      return emptyArray;
    }
    return (this.target as LayoutPage | LayoutPages).findAllById(
      new TraversalTask(this.state, this.rootNode, undefined, undefined),
      id,
    );
  }

  /**
   * Find a node (never a page) by the given ID
   */
  findById(idOrRef: string | NodeRef | undefined): LayoutNode | undefined {
    if ((this.target as any) instanceof BaseLayoutNode) {
      throw new Error('Cannot call findById() on a LayoutNode object');
    }

    const id = isNodeRef(idOrRef) ? idOrRef.nodeRef : idOrRef;
    return (this.target as LayoutPage | LayoutPages).findById(
      new TraversalTask(this.state, this.rootNode, undefined, undefined),
      id,
    );
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
export type NodeTraversalFromNode<N extends LayoutNode> = Omit<
  NodeTraversal<N>,
  'allNodes' | 'findPage' | 'findById' | 'findAllById'
>;

enum Strictness {
  // If the context or nodes are not provided, throw an error upon traversal
  throwError,

  // If the context or nodes are not provided, return ContextNotProvided upon traversal
  returnContextNotProvided,

  // If the context or nodes are not provided, return undefined upon traversal (will usually work like silently
  // never finding what you're looking for when nodes are not present)
  returnUndefined,
}

type InnerSelectorReturns<Strict extends Strictness, U> = Strict extends Strictness.returnUndefined
  ? U | undefined
  : Strict extends Strictness.returnContextNotProvided
    ? U | typeof ContextNotProvided
    : U;

function useNodeTraversalProto<Out>(selector: (traverser: never) => Out, node?: never, strictness?: Strictness): Out {
  const nodesRef = useNodesAsLaxRef();
  const out = NodesInternal.useNodeDataMemoLaxRaw((state) => {
    const nodes = nodesRef.current;
    if (!nodes || nodes === ContextNotProvided) {
      return ContextNotProvided;
    }

    return node === undefined
      ? (selector as any)(new NodeTraversal(state.pages, nodes, nodes))
      : (selector as any)(new NodeTraversal(state.pages, nodes, node));
  });

  if (out === ContextNotProvided) {
    if (strictness === Strictness.throwError) {
      throw new Error('useNodeTraversal() must be used inside a NodesProvider');
    }
    return strictness === Strictness.returnUndefined ? undefined : (selector as any)(ContextNotProvided);
  }

  return out;
}

export function useNodeTraversalLax<Out>(
  selector: (traverser: NodeTraversalFromRoot | typeof ContextNotProvided) => Out,
): Out;
export function useNodeTraversalLax<N extends LayoutPage, Out>(
  selector: (traverser: NodeTraversalFromPage | typeof ContextNotProvided) => Out,
  node: N,
): Out;
export function useNodeTraversalLax<N extends LayoutPage, Out>(
  selector: (traverser: NodeTraversalFromPage | NodeTraversalFromRoot | typeof ContextNotProvided) => Out,
  node: N | undefined,
): Out;
export function useNodeTraversalLax<N extends LayoutNode, Out>(
  selector: (traverser: NodeTraversalFromNode<N> | typeof ContextNotProvided) => Out,
  node: N,
): Out;
export function useNodeTraversalLax<N extends LayoutNode, Out>(
  selector: (traverser: NodeTraversalFromNode<N> | NodeTraversalFromRoot | typeof ContextNotProvided) => Out,
  node: N | undefined,
): Out;
export function useNodeTraversalLax<Out>(selector: (traverser: never) => Out, node?: never): Out {
  return useNodeTraversalProto(selector, node, Strictness.returnContextNotProvided);
}

export function useNodeTraversal<Out>(selector: (traverser: NodeTraversalFromRoot) => Out): Out;
export function useNodeTraversal<N extends LayoutPage, Out>(
  selector: (traverser: NodeTraversalFromPage) => Out,
  node: N,
): Out;
export function useNodeTraversal<N extends LayoutPage, Out>(
  selector: (traverser: NodeTraversalFromPage | NodeTraversalFromRoot) => Out,
  node: N | undefined,
): Out;
export function useNodeTraversal<N extends LayoutNode, Out>(
  selector: (traverser: NodeTraversalFromNode<N>) => Out,
  node: N,
): Out;
export function useNodeTraversal<N extends LayoutNode, Out>(
  selector: (traverser: NodeTraversalFromNode<N> | NodeTraversalFromRoot) => Out,
  node: N | undefined,
): Out;
export function useNodeTraversal<Out>(selector: (traverser: never) => Out, node?: never): Out {
  return useNodeTraversalProto(selector, node, Strictness.throwError);
}

export function useNodeTraversalSilent<Out>(selector: (traverser: NodeTraversalFromRoot) => Out): Out | undefined;
export function useNodeTraversalSilent<N extends LayoutPage, Out>(
  selector: (traverser: NodeTraversalFromPage) => Out,
  node: N,
): Out | undefined;
export function useNodeTraversalSilent<N extends LayoutPage, Out>(
  selector: (traverser: NodeTraversalFromPage | NodeTraversalFromRoot) => Out,
  node: N | undefined,
): Out | undefined;
export function useNodeTraversalSilent<N extends LayoutNode, Out>(
  selector: (traverser: NodeTraversalFromNode<N>) => Out,
  node: N,
): Out | undefined;
export function useNodeTraversalSilent<N extends LayoutNode, Out>(
  selector: (traverser: NodeTraversalFromNode<N> | NodeTraversalFromRoot) => Out,
  node: N | undefined,
): Out | undefined;
export function useNodeTraversalSilent<Out>(selector: (traverser: never) => Out, node?: never): Out | undefined {
  return useNodeTraversalProto(selector, node, Strictness.returnUndefined);
}

/**
 * Hook that returns a selector that lets you traverse the hierarchy at a later time. Will re-render your
 * component when any of the traversals you did would return a different result.
 */
function useNodeTraversalSelectorProto<Strict extends Strictness>(strictness: Strict) {
  const nodesRef = useNodesAsLaxRef();
  const selectState = NodesInternal.useNodeDataMemoSelectorLaxRaw();

  return useCallback(
    <U>(
      innerSelector: (traverser: NodeTraversalFromRoot) => InnerSelectorReturns<Strict, U>,
      deps: any[],
    ): InnerSelectorReturns<Strict, U> => {
      const nodes = nodesRef.current;
      if (selectState === ContextNotProvided || !nodes || nodes === ContextNotProvided) {
        if (strictness === Strictness.returnContextNotProvided) {
          return ContextNotProvided as any;
        }
        if (strictness === Strictness.throwError) {
          throw new Error('useNodeTraversalSelector() must be used inside a NodesProvider');
        }
        return undefined as any;
      }

      return selectState(
        (state) => innerSelector(new NodeTraversal(state.pages, nodes, nodes)),
        [innerSelector.toString(), ...deps],
      );
    },
    [selectState, nodesRef, strictness],
  );
}

export function useNodeTraversalSelector() {
  return useNodeTraversalSelectorProto(Strictness.throwError);
}

export function useNodeTraversalSelectorLax() {
  return useNodeTraversalSelectorProto(Strictness.returnContextNotProvided);
}

export function useNodeTraversalSelectorSilent() {
  return useNodeTraversalSelectorProto(Strictness.returnUndefined);
}

export type NodeTraversalSelector = ReturnType<typeof useNodeTraversalSelector>;
export type NodeTraversalSelectorLax = ReturnType<typeof useNodeTraversalSelectorLax>;
export type NodeTraversalSelectorSilent = ReturnType<typeof useNodeTraversalSelectorSilent>;

export function nodeTraversalSelectorForTests(nodes: LayoutPages): NodeTraversalSelector {
  return (selector: (traverser: NodeTraversalFromRoot) => any) => selector(new NodeTraversal({} as any, nodes, nodes));
}
