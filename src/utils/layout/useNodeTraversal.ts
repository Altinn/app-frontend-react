import { getComponentDef } from 'src/layout';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { isNodeRef } from 'src/utils/layout/nodeRef';
import { NodesInternal, pickDataStorePath, useNodes } from 'src/utils/layout/NodesContext';
import type { CompDef, NodeRef } from 'src/layout';
import type { ParentNode } from 'src/layout/layout';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { PageHierarchy, PageStore } from 'src/utils/layout/NodesContext';
import type { NodeData } from 'src/utils/layout/types';

type Level1LayoutSet = PageHierarchy;
type Level2Page = PageStore;
type Level3Component = NodeData;
type Level2Or3 = Level2Page | Level3Component;

type StartTypes = LayoutNode | LayoutPage | undefined;

export class NodeTraversal {
  private path: string[] = [];

  constructor(
    private state: PageHierarchy,
    private nodes: LayoutPages,
    nodeOrPage: LayoutNode | LayoutPage,
  ) {
    if (!state) {
      throw new Error('NodeTraversal must be initialized with a state');
    }
    this.goto(nodeOrPage);
  }

  /**
   * Sets the path to the given node or page.
   */
  private goto(nodeOrPage: LayoutNode | LayoutPage) {
    if (nodeOrPage instanceof BaseLayoutNode) {
      this.path = nodeOrPage.path;
    }
    if (nodeOrPage instanceof LayoutPage) {
      this.path = [nodeOrPage.pageKey];
    }
  }

  /**
   * Get the state for a given path.
   */
  private get(target: string[] | NodeRef): Level2Or3 {
    if (isNodeRef(target)) {
      const node = this.nodes.findById(target.nodeRef);
      if (!node) {
        throw new NodePathNotFound(`Failed to look up nodeRef '${target.nodeRef}'`);
      }

      return pickDataStorePath(this.state, node);
    }

    return pickDataStorePath(this.state, target);
  }

  /**
   * Get a node object, given some node state
   */
  private getNode(state: Level3Component): LayoutNode {
    return this.nodes.findById(state.item.id)!;
  }

  /**
   * Perform some traversal. This may change the current path temporarily, but this will be reset when
   * traversal is done.
   */
  private traverse<Out>(perform: () => Out): Out {
    const pathWas = [...this.path];
    const result = perform();
    this.path = pathWas;
    return result;
  }

  /**
   * Looks for a matching component upwards in the hierarchy, returning the first one (or undefined if
   * none can be found).
   */
  closest(matching: (state: Level3Component) => boolean): LayoutNode | undefined {
    return this.traverse(() => {
      const state = this.get(this.path);
      if (state.type !== 'node') {
        // We've gone too far up the hierarchy, no more nodes to look at
        return undefined;
      }

      if (state.type === 'node' && matching(this.state)) {
        return this.getNode(state);
      }

      this.path.pop();
      const restriction =
        state.type === 'node' && typeof state.row !== 'undefined' ? { onlyInRowUuid: state.row.uuid } : undefined;
      const sibling = this.firstChild(matching, restriction);
      if (sibling) {
        return sibling;
      }

      // Find the closest one for the parent
      return this.closest(matching);
    });
  }

  /**
   * Like children(), but will only match upwards along the tree towards the top (LayoutPage)
   */
  parents(matching?: (state: Level2Or3) => boolean): ParentNode[] {
    const out: ParentNode[] = [];
    this.recurseParents((state) => {
      if (!matching || matching(state)) {
        out.push(this.getNode(state));
      }
    });
    return out;
  }

  private recurseParents(callback: (state: Level2Or3) => void, path = this.path) {
    this.traverse(() => {
      this.path = path;
      const state = this.get(this.path);
      if (state.type === 'node' || state.type === 'page') {
        callback(state);
      }
      this.path.pop();
      if (state.type === 'node') {
        this.recurseParents(callback, this.path);
      }
    });
  }

  /**
   * Looks for a matching component inside the (direct) children of this node (only makes sense for
   * a group/container node). This will only return the first match.
   */
  firstChild(
    matching: (state: Level3Component) => boolean,
    restriction?: ChildLookupRestriction,
  ): LayoutNode | undefined {
    return this.traverse(() => {
      const state = this.get(this.path);
      if (state.type !== 'node') {
        return undefined;
      }

      const children = this.children(matching, restriction);
      return children.length ? children[0] : undefined;
    });
  }

  private childrenAsList(state: Level3Component, restriction?: ChildLookupRestriction): Level3Component[] {
    const def = getComponentDef(state.item?.type ?? state.layout.type) as CompDef<any>;
    const refs = def.pickDirectChildren(state, restriction) as NodeRef[];
    return refs.map((ref) => this.get(ref));
  }

  /**
   * Looks for a matching component inside the (direct) children of this node (only makes sense for
   * a group/container node).
   *
   * Beware that matching inside a repeating group with multiple rows, you may want to provide a second argument
   * to specify which row to look in, otherwise you will find instances of the component in all rows.
   */
  children(matching?: (state: Level3Component) => boolean, restriction?: ChildLookupRestriction): LayoutNode[] {
    return this.traverse(() => {
      const children: LayoutNode[] = [];
      const state = this.get(this.path);
      if (state.type !== 'node') {
        return children;
      }

      const childStates = this.childrenAsList(state, restriction);
      for (const child of childStates) {
        if (!matching || matching(child)) {
          children.push(this.getNode(child));
        }
      }

      return children;
    });
  }

  /**
   * This returns all the child nodes (including duplicate components for repeating groups and children of children) as
   * a flat list of LayoutNode objects.
   */
  flat(restriction?: ChildLookupRestriction): LayoutNode[] {
    return this.traverse(() => {
      const out: LayoutNode[] = [];
      const state = this.get(this.path);
      if (state.type !== 'node') {
        return out;
      }

      const children = this.childrenAsList(state, restriction);
      for (const child of children) {
        out.push(this.getNode(child));
        this.path.push(child.item.id);
        out.push(...this.flat(restriction));
        this.path.pop();
      }

      return out;
    });
  }
}

/**
 * Hook used when you want to traverse the hierarchy of a node, starting from a specific node.
 */
export function useNodeTraversal<N extends StartTypes, Out>(
  node: N,
  selector: (traverser: NodeTraversal) => Out,
): N extends undefined ? undefined : Out {
  const nodes = useNodes();
  return NodesInternal.useNodeDataMemoRaw((state) =>
    node == undefined ? undefined : selector(new NodeTraversal(state, nodes, node)),
  ) as any;
}
