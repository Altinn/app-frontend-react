import { getLayoutComponentObject } from 'src/layout';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import { transposeDataBinding } from 'src/utils/databindings/DataBinding';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { isNodeRef } from 'src/utils/layout/nodeRef';
import { pickNodePath } from 'src/utils/layout/NodesContext';
import type { CompClassMap, CompDef, FormDataSelector, NodeRef } from 'src/layout';
import type { CompCategory } from 'src/layout/common';
import type { ComponentTypeConfigs } from 'src/layout/components.generated';
import type { CompExternalExact, CompInternal, CompTypes, LayoutNodeFromCategory, ParentNode } from 'src/layout/layout';
import type { IComponentFormData } from 'src/utils/formComponentUtils';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutObject } from 'src/utils/layout/LayoutObject';
import type { NodesDataStore } from 'src/utils/layout/NodesContext';
import type { BaseRow } from 'src/utils/layout/types';

export interface IsHiddenOptions {
  respectLegacy?: boolean;
  respectDevTools?: boolean;
  respectTracks?: boolean;
}

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
  public readonly store: NodesDataStore;
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
    this.def = getLayoutComponentObject(this.type);
    this.store = store;
    this.path = path;
    this.parent = parent;
    this.row = row;
  }

  /**
   * Gets the item state from the store.
   * Please note that this state is the current state, and getting this state will not make your component
   * re-render if this state changes. For that, useNodeItem() instead.
   */
  public get item() {
    const node = pickNodePath(this.store.getState().pages, this.path);
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

  public isSameAs(otherNode: LayoutObject | NodeRef) {
    if (isNodeRef(otherNode)) {
      return this.id === otherNode.nodeRef;
    }

    return otherNode instanceof BaseLayoutNode && this.id === otherNode.id;
  }

  public isSame(): (otherNode: LayoutObject | NodeRef) => boolean {
    return (otherNode) => this.isSameAs(otherNode);
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

  /**
   * Looks for a matching component upwards in the hierarchy, returning the first one (or undefined if
   * none can be found).
   */
  public closest(matching: (item: CompInternal) => boolean): this | LayoutNode | undefined {
    if (matching(this.item as CompInternal)) {
      return this;
    }

    const restriction = typeof this.row?.uuid !== 'undefined' ? { onlyInRowUuid: this.row.uuid } : undefined;
    const sibling = this.parent.children(matching, restriction);
    if (sibling) {
      return sibling as LayoutNode;
    }

    return this.parent.closest(matching);
  }

  private recurseParents(callback: (node: ParentNode) => void) {
    callback(this.parent);
    if (!(this.parent instanceof LayoutPage)) {
      this.parent.recurseParents(callback);
    }
  }

  /**
   * Like children(), but will only match upwards along the tree towards the top (LayoutPage)
   */
  public parents(matching?: (item: ParentNode) => boolean): ParentNode[] {
    const parents: ParentNode[] = [];
    this.recurseParents((node) => parents.push(node));

    if (matching) {
      return parents.filter(matching);
    }

    return parents;
  }

  private childrenAsList(_restriction?: ChildLookupRestriction): LayoutNode[] {
    const def = this.def as CompDef<any>;
    if (def instanceof ContainerComponent) {
      // TODO: Get children from the hierarchy generator
      // const hierarchy = def.hierarchyGenerator();
      // return hierarchy.childrenFromNode(this, restriction);
      return [];
    }

    return [];
  }

  /**
   * Looks for a matching component inside the (direct) children of this node (only makes sense for a group node).
   * Beware that matching inside a repeating group with multiple rows, you should provide a second argument to specify
   * the row number, otherwise you'll most likely just find a component on the first row.
   */
  public children(): LayoutNode[];
  public children(
    matching: (item: CompInternal) => boolean,
    restriction?: ChildLookupRestriction,
  ): LayoutNode | undefined;
  public children(matching: undefined, restriction?: ChildLookupRestriction): LayoutNode[];
  public children(matching?: (item: CompInternal) => boolean, restriction?: ChildLookupRestriction): any {
    const list = this.childrenAsList(restriction);
    if (!matching) {
      return list;
    }

    for (const node of list) {
      if (matching(node.item)) {
        return node;
      }
    }

    return undefined;
  }

  /**
   * This returns all the child nodes (including duplicate components for repeating groups) as a flat list of
   * LayoutNode objects. Implemented here for parity with LayoutPage.
   *
   * @param restriction If set, it will only include children with the given row UUID or row index. It will still
   *        include all children of nested groups regardless of row-id or index.
   */
  public flat(restriction?: ChildLookupRestriction): LayoutNode[] {
    const out: LayoutNode[] = [];
    const recurse = (item: LayoutNode, restriction?: ChildLookupRestriction) => {
      out.push(item);
      for (const child of item.children(undefined, restriction)) {
        recurse(child);
      }
    };

    recurse(this as unknown as LayoutNode, restriction);
    return out as LayoutNode[];
  }

  /**
   * Checks if this field should be hidden. This also takes into account the group this component is in, so the
   * methods returns true if the component is inside a hidden group.
   */
  public isHidden(_options: IsHiddenOptions = {}): boolean {
    // TODO: Enable this again, but calculate it all in the hierarchy generator component instead of here.
    return false;
    //   const { respectLegacy = true, respectDevTools = true, respectTracks = false } = options;
    //
    //   // Bit field containing the flags
    //   const cacheKey = (respectLegacy ? 1 : 0) | (respectDevTools ? 2 : 0) | (respectTracks ? 4 : 0);
    //
    //   if (this.hiddenCache[cacheKey] !== undefined) {
    //     return this.hiddenCache[cacheKey] as boolean;
    //   }
    //
    //   const isHidden = respectLegacy ? this.dataSources.isHidden : () => false;
    //   if (respectDevTools && this.dataSources.devToolsIsOpen && this.dataSources.devToolsHiddenComponents !== 'hide') {
    //     this.hiddenCache[cacheKey] = false;
    //     return false;
    //   }
    //
    //   if (isHidden(this.baseId)) {
    //     this.hiddenCache[cacheKey] = true;
    //     return true;
    //   }
    //
    //   if (isHidden(this.id)) {
    //     this.hiddenCache[cacheKey] = true;
    //     return true;
    //   }
    //
    //   const hiddenInParent =
    //     this.parent instanceof BaseLayoutNode && (this.parent as BaseLayoutNode).isDirectChildHidden(this, options);
    //   if (hiddenInParent) {
    //     this.hiddenCache[cacheKey] = true;
    //     return true;
    //   }
    //
    //   if (
    //     respectTracks &&
    //     this.parent instanceof LayoutPage &&
    //     this.parent.isHiddenViaTracks(this.dataSources.layoutSettings, this.dataSources.pageNavigationConfig)
    //   ) {
    //     this.hiddenCache[cacheKey] = true;
    //     return true;
    //   }
    //
    //   const hiddenByParent = this.parent instanceof BaseLayoutNode && this.parent.isHidden(options);
    //   this.hiddenCache[cacheKey] = hiddenByParent;
    //   return hiddenByParent;
  }

  protected isDirectChildHidden(_directChild: BaseLayoutNode, _options: IsHiddenOptions): boolean {
    return false;
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

  /**
   * Gets the current form data for this component
   */
  public getFormData(formDataSelector: FormDataSelector): IComponentFormData<Type> {
    const item = this.item;
    if (!('dataModelBindings' in item) || !item.dataModelBindings) {
      return {} as IComponentFormData<Type>;
    }

    const formDataObj: { [key: string]: any } = {};
    for (const key of Object.keys(item.dataModelBindings)) {
      const binding = item.dataModelBindings[key];
      const data = formDataSelector(binding);

      if (key === 'list') {
        formDataObj[key] = data ?? [];
      } else if (key === 'simpleBinding') {
        formDataObj[key] = data != null ? String(data) : '';
      } else {
        formDataObj[key] = data;
      }
    }

    return formDataObj as IComponentFormData<Type>;
  }
}

export type LayoutNode<Type extends CompTypes = CompTypes> = Type extends CompTypes
  ? ComponentTypeConfigs[Type]['nodeObj']
  : BaseLayoutNode;
