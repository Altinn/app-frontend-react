import { getRepeatingGroupStartStopIndex } from 'src/utils/formLayout';
import type {
  ComponentExceptGroup,
  IDataModelBindings,
  ILayout,
  ILayoutComponent,
  ILayoutGroup,
} from 'src/features/form/layout';
import type { IRepeatingGroups } from 'src/types';

export interface ILayoutGroupHierarchy extends Omit<ILayoutGroup, 'children'> {
  childComponents: (ILayoutComponent | ILayoutGroupHierarchy)[];
}

export const childrenWithoutMultiPagePrefix = (group: ILayoutGroup) =>
  group.edit?.multiPage
    ? group.children.map((componentId) => componentId.replace(/^\d+:/g, ''))
    : group.children;

function componentsAndGroupsInGroup(
  layout: ILayout,
  filter: (component: ILayoutComponent | ILayoutGroup) => boolean,
): (ILayoutComponent | ILayoutGroupHierarchy)[] {
  const all = layout.filter(filter);
  const groups = all.filter(
    (component) => component.type === 'Group',
  ) as ILayoutGroup[];
  const components = all.filter(
    (component) => component.type !== 'Group',
  ) as ILayoutComponent[];

  return [
    ...components,
    ...groups.map((group) => {
      const out: ILayoutGroupHierarchy = {
        ...group,
        childComponents: componentsAndGroupsInGroup(layout, (component) =>
          childrenWithoutMultiPagePrefix(group).includes(component.id),
        ),
      };
      delete out['children'];

      return out;
    }),
  ];
}

/**
 * Takes a flat layout and turns it into a hierarchy. That means, each group component will not have
 * references to each component inside the group, it will have the component definitions themselves
 * nested inside the 'childComponents' property.
 *
 * If this abstraction level is not fine enough for you, you might want to look into these utils:
 *    layoutAsHierarchyWithRows() takes this further by giving you a all the components as a hierarchy,
 *        but also includes every component in a repeating group multiple times (for each row in the group).
 *        It will also give you proper componentIds and dataModelBindings for the component so you
 *        can reference validations, attachments, formData, etc.
 *    nodesInLayout() takes it even further, but also simplifies the structure by giving you
 *        a flat list. This list includes all components (multiple instances of them for rows in
 *        repeating groups), but wraps them in a class which is aware of the component location
 *        inside the whole layout, allowing you to, for example, find a sibling instance of a
 *        component inside a repeating group - complete with proper componentId and dataModelBindings.
 *
 * Note: This strips away multiPage functionality and treats every component of a multiPage group
 * as if every component is on the same page.
 */
export function layoutAsHierarchy(
  layout: ILayout,
): (ILayoutComponent | ILayoutGroupHierarchy)[] {
  const allGroups = layout.filter((value) => value.type === 'Group');
  const inGroups = allGroups.map(childrenWithoutMultiPagePrefix).flat();
  const topLevelFields = layout
    .filter(
      (component) =>
        component.type !== 'Group' && !inGroups.includes(component.id),
    )
    .map((component) => component.id);
  const topLevelGroups = allGroups
    .filter((group) => !inGroups.includes(group.id))
    .map((group) => group.id);

  return componentsAndGroupsInGroup(
    layout,
    (component) =>
      topLevelFields.includes(component.id) ||
      topLevelGroups.includes(component.id),
  );
}

export interface IRepeatingGroupExtensions {
  baseDataModelBindings?: IDataModelBindings;
}

export type IRepeatingGroupLayoutComponent<
  T extends ComponentExceptGroup = ComponentExceptGroup,
> = IRepeatingGroupExtensions & ILayoutComponent<T>;

export interface IRepeatingGroupHierarchy
  extends Omit<ILayoutGroupHierarchy, 'childComponents' | 'children'>,
    IRepeatingGroupExtensions {
  rows: HierarchyWithRowsChildren[][];
}

// Types of possible components on the top level of a repeating group hierarchy with rows
export type HierarchyWithRows =
  | ILayoutComponent
  | ILayoutGroupHierarchy // Non-repeating groups
  | IRepeatingGroupHierarchy;

// Types of possible components inside rows. Note that no plain 'iLayoutComponent' is valid here,
// as all components inside repeating group rows needs to have a baseComponentId, etc.
export type HierarchyWithRowsChildren =
  | IRepeatingGroupLayoutComponent
  | ILayoutGroupHierarchy // Non-repeating groups
  | IRepeatingGroupHierarchy;

interface HierarchyParent {
  index: number;
  binding: string;
}

/**
 * This function takes the logic from layoutAsHierarchy() further by giving you a all the components as a hierarchy,
 * but it also includes every component in a repeating group multiple times (for each row in the group). It will also
 * give you proper componentIds and dataModelBindings for the component so you can reference validations, attachments,
 * formData, etc.
 *
 * If this abstraction level is not the right one for your needs, you might want to look into these utils:
 *    layoutAsHierarchy() is a bit simpler, as it converts a simple flat layout into a hierarchy
 *        of components - although it doesn't know anything about repeating groups and their rows.
 *    nodesInLayout() takes it even further, but also simplifies the structure by giving you
 *        a flat list. This list includes all components (multiple instances of them for rows in
 *        repeating groups), but wraps them in a class which is aware of the component location
 *        inside the whole layout, allowing you to, for example, find a sibling instance of a
 *        component inside a repeating group - complete with proper componentId and dataModelBindings.
 *
 * Note: This strips away multiPage functionality and treats every component of a multiPage group
 * as if every component is on the same page.
 */
export function layoutAsHierarchyWithRows(
  formLayout: ILayout,
  repeatingGroups: IRepeatingGroups,
): HierarchyWithRows[] {
  const rewriteBindings = (
    main: ILayoutGroupHierarchy,
    child: ILayoutGroupHierarchy | ILayoutComponent,
    newChild: IRepeatingGroupLayoutComponent,
    parent: HierarchyParent,
    index: number,
  ) => {
    const baseGroupBinding =
      (main as IRepeatingGroupExtensions).baseDataModelBindings?.group ||
      main.dataModelBindings?.group;

    let binding = main.dataModelBindings?.group;
    if (binding && parent) {
      binding = binding.replace(baseGroupBinding, `${parent.binding}`);
    }

    newChild.baseDataModelBindings = { ...child.dataModelBindings };
    for (const key of Object.keys(child.dataModelBindings)) {
      newChild.dataModelBindings[key] = child.dataModelBindings[key].replace(
        baseGroupBinding,
        `${binding}[${index}]`,
      );
    }
  };

  const recurse = (
    main: ILayoutComponent | ILayoutGroupHierarchy,
    parent?: HierarchyParent,
  ) => {
    if (main.type === 'Group' && main.maxCount > 1) {
      const rows: IRepeatingGroupHierarchy['rows'] = [];
      const { startIndex, stopIndex } = getRepeatingGroupStartStopIndex(
        repeatingGroups[main.id]?.index,
        main.edit,
      );
      for (let index = startIndex; index <= stopIndex; index++) {
        const row = main.childComponents.map((child) => {
          const suffix = parent ? `-${parent.index}-${index}` : `-${index}`;
          const newId = `${child.id}${suffix}`;
          const newChild: IRepeatingGroupLayoutComponent = {
            ...JSON.parse(JSON.stringify(child)),
            id: newId,
            baseComponentId: child.id,
          };

          if (child.dataModelBindings) {
            rewriteBindings(main, child, newChild, parent, index);
          }

          return recurse(newChild, {
            index,
            binding: main.dataModelBindings?.group,
          });
        });
        rows.push(row);
      }

      const out: IRepeatingGroupHierarchy = { ...main, rows };
      delete out['childComponents'];
      return out;
    }

    return main as IRepeatingGroupLayoutComponent;
  };

  return layoutAsHierarchy(formLayout).map((child) => recurse(child));
}

export type AnyLayoutNode =
  | ILayoutComponent
  | ILayoutGroup
  | IRepeatingGroupLayoutComponent
  | ILayoutGroupHierarchy
  | IRepeatingGroupHierarchy;

export type AnyLayoutParent = IRepeatingGroupHierarchy | ILayoutGroupHierarchy;

export type AnyLayoutNodeTopLevel =
  | ILayoutComponent
  | IRepeatingGroupLayoutComponent
  | IRepeatingGroupHierarchy
  | ILayoutGroupHierarchy;

export class LayoutRootNode<
  Direct extends AnyLayoutNodeTopLevel = AnyLayoutNodeTopLevel,
  All extends AnyLayoutNode = AnyLayoutNode,
> {
  public item: AnyLayoutNode | undefined;
  public parent: this;

  private directChildren: LayoutNode<Direct>[] = [];
  private allChildren: LayoutNode<Direct | All>[] = [];
  private idMap: { [id: string]: number[] } = {};

  public _addChild(
    child: LayoutNode<All | Direct>,
    parent: LayoutNode<All | Direct> | this,
  ) {
    if (parent === this) {
      this.directChildren.push(child as LayoutNode<Direct>);
    }
    const idx = this.allChildren.length;
    this.allChildren.push(child);

    this.idMap[child.item.id] = this.idMap[child.item.id] || [];
    this.idMap[child.item.id].push(idx);

    if (child.item.baseComponentId) {
      this.idMap[child.item.baseComponentId] =
        this.idMap[child.item.baseComponentId] || [];
      this.idMap[child.item.baseComponentId].push(idx);
    }
  }

  public closest(
    matching: (item: Direct) => boolean,
  ): LayoutNode<Direct> | undefined {
    return this.children(matching);
  }

  public children(): LayoutNode<Direct>[];
  public children(matching: (item: Direct) => boolean): LayoutNode<Direct>;
  public children(
    matching?: (item: Direct) => boolean,
  ): LayoutNode<Direct> | LayoutNode<Direct>[] {
    if (!matching) {
      return this.directChildren;
    }

    for (const item of this.directChildren) {
      if (matching(item.item)) {
        return item;
      }
    }

    return undefined;
  }

  public flat(includeGroups: true): LayoutNode<Direct | All>[];
  public flat(includeGroups: false): LayoutNode<ILayoutComponent>[];
  public flat(includeGroups: boolean): LayoutNode<any>[] {
    if (!includeGroups) {
      return this.allChildren.filter((c) => c.item.type !== 'Group');
    }

    return this.allChildren;
  }

  public findById(id: string): LayoutNode<Direct | All> {
    if (this.idMap[id] && this.idMap[id].length) {
      return this.allChildren[this.idMap[id][0]];
    }

    return undefined;
  }

  public findAllById(id: string): LayoutNode<Direct | All>[] {
    if (this.idMap[id] && this.idMap[id].length) {
      return this.idMap[id].map((idx) => this.allChildren[idx]);
    }

    return [];
  }
}

/**
 * A LayoutNode wraps a component with information about its parent, allowing you to traverse a component (or an
 * instance of a component inside a repeating group), finding other components near it.
 */
export class LayoutNode<T extends AnyLayoutNode = AnyLayoutNode> {
  public constructor(
    public item: T,
    public parent: LayoutNode<AnyLayoutParent> | LayoutRootNode,
    protected rowIndex?: number,
  ) {}

  /**
   * Looks for a matching component upwards in the hierarchy, returning the first one (or undefined if
   * none can be found).
   */
  public closest(
    matching: (item: AnyLayoutNode) => boolean,
  ): LayoutNode<AnyLayoutNode> | undefined {
    if (matching(this.item)) {
      return this;
    }

    const sibling = this.parent.children(matching, this.rowIndex);
    if (sibling) {
      return sibling as LayoutNode<AnyLayoutNode>;
    }

    return this.parent.closest(matching);
  }

  private recurseParents(
    callback: (item: LayoutNode<AnyLayoutParent> | LayoutRootNode) => void,
  ) {
    callback(this.parent);
    if (!(this.parent instanceof LayoutRootNode)) {
      this.parent.recurseParents(callback);
    }
  }

  public parents(
    matching?: (item: LayoutNode<AnyLayoutParent> | LayoutRootNode) => boolean,
  ): (LayoutNode<AnyLayoutParent> | LayoutRootNode)[] {
    const parents = [];
    this.recurseParents((item) => parents.push(item));

    if (matching) {
      return parents.filter(matching);
    }

    return parents;
  }

  /**
   * Looks for a matching component inside the children of this node (only makes sense for a group node). Beware that
   * matching inside a repeating group with multiple rows, you should provide a second argument to specify the row
   * number, otherwise you'll most likely just find a component on the first row.
   */
  public children(
    matching: (item: AnyLayoutNode) => boolean,
    onlyInRowIndex?: number,
  ): LayoutNode<AnyLayoutNode> | undefined {
    let list: AnyLayoutNode[];
    if (this.item.type === 'Group' && 'rows' in this.item) {
      if (typeof onlyInRowIndex === 'number') {
        list = this.item.rows[onlyInRowIndex];
      } else {
        // Beware: In most cases this will just match the first row.
        list = this.item.rows.flat();
      }
    } else if (this.item.type === 'Group' && 'childComponents' in this.item) {
      list = this.item.childComponents;
    }

    if (typeof list !== 'undefined') {
      for (const item of list) {
        if (matching(item)) {
          return new LayoutNode(item, this as LayoutNode<AnyLayoutParent>);
        }
      }
    }

    return undefined;
  }

  /**
   * Checks if this field should be hidden. This also takes into account the group this component is in, so the
   * methods returns true if the component is inside a hidden group.
   */
  public isHidden(hiddenFieldIds: Set<string>): boolean {
    if (hiddenFieldIds.has(this.item.id)) {
      return true;
    }
    if (
      this.item.baseComponentId &&
      hiddenFieldIds.has(this.item.baseComponentId)
    ) {
      return true;
    }

    const parentGroups = this.parents(
      (parent) => parent.item && parent.item.type === 'Group',
    );

    for (const parent of parentGroups) {
      if (hiddenFieldIds.has(parent.item.id)) {
        return true;
      }
      if (
        parent.item.baseComponentId &&
        hiddenFieldIds.has(parent.item.baseComponentId)
      ) {
        return true;
      }
    }

    return false;
  }
}

/**
 * Takes the layoutAsHierarchyWithRows() tool a bit further, but returns a flat list. This list includes all components
 * (multiple instances of them for rows in repeating groups), but wraps them in a LayoutNode object which is aware of the
 * component location inside the whole layout, allowing you to, for example, find a sibling instance of a component
 * inside a repeating group - complete with proper componentId and dataModelBindings.
 *
 * If this abstraction level is overkill for you, you might want to look into these utils:
 *    layoutAsHierarchy() is much simpler, as it converts a simple flat layout into a hierarchy
 *        of components - although it doesn't know anything about repeating groups and their rows.
 *    layoutAsHierarchyWithRows() is a bit simpler by giving you a all the components as a hierarchy,
 *        but also includes every component in a repeating group multiple times (for each row in the group).
 *        It will also give you proper componentIds and dataModelBindings for the component so you
 *        can reference validations, attachments, formData, etc. However, it might be harder to
 *        use if you know exactly which component you're looking for, if recursive iteration makes
 *        things more difficult, or if you need to traverse through the layout more than once.
 *
 * Note: This strips away multiPage functionality and treats every component of a multiPage group
 * as if every component is on the same page.
 */
export function nodesInLayout(
  formLayout: ILayout,
  repeatingGroups: IRepeatingGroups,
): LayoutRootNode {
  const root = new LayoutRootNode();

  const recurse = (
    list: (
      | ILayoutComponent
      | ILayoutGroupHierarchy
      | IRepeatingGroupHierarchy
    )[],
    parent?: LayoutNode<AnyLayoutParent> | LayoutRootNode,
    rowIndex?: number,
  ) => {
    for (const component of list) {
      if (component.type === 'Group' && 'rows' in component) {
        const group: LayoutNode<AnyLayoutParent> = new LayoutNode(
          component,
          parent,
          rowIndex,
        );
        component.rows.forEach((row, rowIndex) =>
          recurse(row, group, rowIndex),
        );
        root._addChild(group, parent);
      } else if (component.type === 'Group' && 'childComponents' in component) {
        const group: LayoutNode<AnyLayoutParent> = new LayoutNode(
          component,
          parent,
          rowIndex,
        );
        recurse(component.childComponents, group);
        root._addChild(group, parent);
      } else {
        const node = new LayoutNode(component, parent, rowIndex);
        root._addChild(node, parent);
      }
    }
  };

  recurse(layoutAsHierarchyWithRows(formLayout, repeatingGroups), root);

  return root;
}

/**
 * A tool when you have more than one LayoutRootNode (i.e. a full layout set). It can help you look up components
 * by ID, and if you have colliding component IDs in multiple layouts it will prefer the one in the current layout.
 */
export class LayoutRootNodeCollection<
  T extends { [layoutKey: string]: LayoutRootNode },
> {
  public constructor(private currentView: keyof T, private objects: T) {}

  public findComponentById(id: string): LayoutNode | undefined {
    const inCurrent = this.current().findById(id);
    if (inCurrent) {
      return inCurrent;
    }

    for (const otherLayoutKey of Object.keys(this.objects)) {
      if (otherLayoutKey === this.currentView) {
        continue;
      }
      const inOther = this.objects[otherLayoutKey].findById(id);
      if (inOther) {
        return inOther;
      }
    }

    return undefined;
  }

  public findAllComponentsById(id: string): LayoutNode[] {
    const out: LayoutNode[] = [];

    for (const key of Object.keys(this.objects)) {
      out.push(...this.objects[key].findAllById(id));
    }

    return out;
  }

  public findLayout(key: keyof T): LayoutRootNode {
    return this.objects[key];
  }

  public current(): LayoutRootNode {
    return this.objects[this.currentView];
  }
}
