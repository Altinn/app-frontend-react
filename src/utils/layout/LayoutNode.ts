import { getComponentDef } from 'src/layout';
import { transposeDataBinding } from 'src/utils/databindings/DataBinding';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { pickDataStorePath } from 'src/utils/layout/NodesContext';
import type { CompClassMap, CompDef } from 'src/layout';
import type { CompCategory } from 'src/layout/common';
import type { ComponentTypeConfigs } from 'src/layout/components.generated';
import type { CompExternalExact, CompInternal, CompTypes, LayoutNodeFromCategory, ParentNode } from 'src/layout/layout';
import type { LayoutObject } from 'src/utils/layout/LayoutObject';
import type { NodesDataStore } from 'src/utils/layout/NodesContext';
import type { BaseRow } from 'src/utils/layout/types';
import type { TraversalTask } from 'src/utils/layout/useNodeTraversal';

export interface LayoutNodeProps<Type extends CompTypes> {
  item: CompExternalExact<Type>;
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
    const node = pickDataStorePath(this.store.getState().pages, this.path);
    if (!node || node.type !== 'node') {
      throw new Error(`Node not found in path: /${this.path.join('/')}`);
    }
    return node.item as CompInternal<Type>;
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

  private childrenAsList(task: TraversalTask): LayoutNode[] {
    const def = this.def as CompDef<any>;
    return def.pickDirectChildren(this.store.getState(), task);
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

  private firstDataModelBinding() {
    const item = this.item;
    const firstBinding = Object.keys(item.dataModelBindings || {}).shift();
    if (firstBinding && 'dataModelBindings' in item && item.dataModelBindings) {
      return item.dataModelBindings[firstBinding];
    }

    return undefined;
  }

  /**
   * This takes a dataModel path (without indexes) and alters it to add indexes such that the data model path refers
   * to an item in the same repeating group row (or nested repeating group row) as the data model for the current
   * component.
   *
   * Example: Let's say this component is in the second row of the first repeating group, and inside the third row
   * of a nested repeating group. Our data model binding is such:
   *    simpleBinding: 'MyModel.Group[1].NestedGroup[2].FirstName'
   *
   * If you pass the argument 'MyModel.Group.NestedGroup.Age' to this function, you'll get the
   * transposed binding back: 'MyModel.Group[1].NestedGroup[2].Age'.
   *
   * If you pass the argument 'MyModel.Group[2].NestedGroup[3].Age' to this function, it will still be transposed to
   * the current row indexes: 'MyModel.Group[1].NestedGroup[2].Age' unless you pass overwriteOtherIndices = false.
   */
  public transposeDataModel(dataModelPath: string, rowIndex?: number): string {
    const firstBinding = this.firstDataModelBinding();
    if (!firstBinding) {
      if (this.parent instanceof BaseLayoutNode) {
        return this.parent.transposeDataModel(dataModelPath, this.row?.index);
      }

      return dataModelPath;
    }

    const currentLocationIsRepGroup = this.isType('RepeatingGroup');
    return transposeDataBinding({
      subject: dataModelPath,
      currentLocation: firstBinding,
      rowIndex,
      currentLocationIsRepGroup,
    });
  }
}

export type LayoutNode<Type extends CompTypes = CompTypes> = Type extends CompTypes
  ? ComponentTypeConfigs[Type]['nodeObj']
  : BaseLayoutNode;
