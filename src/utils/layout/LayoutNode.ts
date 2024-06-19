import { getComponentDef } from 'src/layout';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { CompClassMap, CompDef, NodeRef } from 'src/layout';
import type { CompCategory } from 'src/layout/common';
import type { ComponentTypeConfigs } from 'src/layout/components.generated';
import type { CompIntermediate, CompInternal, CompTypes, LayoutNodeFromCategory, ParentNode } from 'src/layout/layout';
import type { LayoutObject } from 'src/utils/layout/LayoutObject';
import type { NodesDataStore } from 'src/utils/layout/NodesContext';
import type { BaseRow } from 'src/utils/layout/types';
import type { TraversalTask } from 'src/utils/layout/useNodeTraversal';

export interface LayoutNodeProps<Type extends CompTypes> {
  item: CompIntermediate<Type>;
  store: NodesDataStore;
  path: string[];
  parent: ParentNode;
  row?: BaseRow;
}

/**
 * A LayoutNode wraps a component with information about its parent, allowing you to traverse a component (or an
 * instance of a component inside a repeating group), finding other components near it.
 */
export class BaseLayoutNode<Type extends CompTypes = CompTypes> implements LayoutObject {
  protected readonly store: NodesDataStore;
  public readonly path: string[];
  public readonly parent: ParentNode;
  public readonly page: LayoutPage;
  public readonly row?: BaseRow;
  public readonly def: CompClassMap[Type];

  // Common properties that are overwritten when changed in the item store
  protected id: string;
  protected baseId: string;
  protected type: Type;
  protected multiPageIndex: number | undefined;

  public constructor({ item, store, path, parent, row }: LayoutNodeProps<Type>) {
    this.updateCommonProps(item as CompInternal<Type>);
    this.page = parent instanceof LayoutPage ? parent : parent.page;
    this.def = getComponentDef(this.type);
    this.store = store;
    this.path = path;
    this.parent = parent;
    this.row = row;
  }

  /**
   * Gets the item state from the store.
   * Please note that this state is the current state, and getting this state will not make your component
   * re-render if this state changes. For that, useNodeItem() instead.
   *
   * TODO: Find usages and make them useNodeItem() instead.
   */
  public get item() {
    const nodeData = this.store.getState().nodeData[this.getId()];
    if (!nodeData || nodeData.type !== 'node') {
      throw new Error(`Node not found in path: /${this.path.join('/')}`);
    }
    if (!nodeData.item) {
      throw new Error(`Node item not found in path: /${this.path.join('/')}`);
    }
    return nodeData.item as CompInternal<Type>;
  }

  public updateCommonProps(item = this.item) {
    this.id = item.id;
    this.baseId = item.baseComponentId || item.id;
    this.type = item.type as Type;
    this.multiPageIndex = item.multiPageIndex;
  }

  public getId() {
    return this.id;
  }

  public getBaseId() {
    return this.baseId;
  }

  public getMultiPageIndex() {
    return this.multiPageIndex;
  }

  public isType<T extends CompTypes>(type: T): this is LayoutNode<T> {
    return (this.type as any) === type;
  }

  public getType(): Type {
    return this.type;
  }

  public isCategory<T extends CompCategory>(category: T): this is LayoutNodeFromCategory<T> {
    return this.def.category === category;
  }

  public pageKey(): string {
    return this.page.pageKey;
  }

  public closest(task: TraversalTask, _passedFrom?: LayoutPage | LayoutNode): LayoutNode | undefined {
    if (task.passes(this)) {
      return this as LayoutNode;
    }

    const restriction = typeof this.row?.uuid !== 'undefined' ? { onlyInRowUuid: this.row.uuid } : undefined;
    const sibling = this.parent.firstChild(task.addRestriction(restriction));
    if (sibling) {
      return sibling as LayoutNode;
    }

    return this.parent.closest(task, this as LayoutNode);
  }

  private recurseParents(callback: (node: ParentNode) => void) {
    callback(this.parent);
    if (!(this.parent instanceof LayoutPage)) {
      this.parent.recurseParents(callback);
    }
  }

  public parents(task: TraversalTask): ParentNode[] {
    const parents: ParentNode[] = [];
    this.recurseParents((node) => parents.push(node));
    return parents.filter((parent) => task.passes(parent));
  }

  private childrenAsList(task: TraversalTask) {
    const def = this.def as CompDef<any>;
    const refs = def.pickDirectChildren(task.getData(this), task.restriction) as NodeRef[];
    return refs.map((ref) => task.getNode(ref)) as LayoutNode[];
  }

  public firstChild(task: TraversalTask): LayoutNode | undefined {
    const list = this.childrenAsList(task);
    for (const node of list) {
      if (task.passes(node)) {
        return node;
      }
    }

    return undefined;
  }

  public children(task: TraversalTask): LayoutNode[] {
    const list = this.childrenAsList(task);
    if (task.allPasses()) {
      return list;
    }

    const out: LayoutNode[] = [];
    for (const node of list) {
      if (task.passes(node)) {
        out.push(node);
      }
    }

    return out;
  }

  public flat(task: TraversalTask): LayoutNode[] {
    const out: LayoutNode[] = [];
    const recurse = (n: LayoutNode) => {
      task.passes(n) && out.push(n);
      for (const child of n.children(task)) {
        recurse(child);
      }
    };

    recurse(this as unknown as LayoutNode);
    return out as LayoutNode[];
  }
}

export type LayoutNode<Type extends CompTypes = CompTypes> = Type extends CompTypes
  ? ComponentTypeConfigs[Type]['nodeObj']
  : BaseLayoutNode;
