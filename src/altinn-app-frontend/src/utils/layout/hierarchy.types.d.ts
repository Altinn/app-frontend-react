import type {
  IDataModelBindings,
  ILayoutComponent,
  ILayoutGroup,
} from 'src/features/form/layout';
import type { LEResolved } from 'src/features/form/layout/expressions/types';
import type { LayoutNode, LayoutRootNode } from 'src/utils/layout/hierarchy';

export type NodeType =
  // Plain nodes include layout expressions
  | 'plain'
  // Resolved nodes have their layout expressions resolved
  | 'resolved';

export type ComponentOf<NT extends NodeType> = NT extends 'plain'
  ? ILayoutComponent
  : LEResolved<ILayoutComponent>;

export type GroupOf<NT extends NodeType> = NT extends 'plain'
  ? ILayoutGroup
  : LEResolved<ILayoutGroup>;

export type LayoutGroupHierarchy<NT extends NodeType = 'plain'> = Omit<
  GroupOf<NT>,
  'children'
> & {
  childComponents: (ComponentOf<NT> | LayoutGroupHierarchy<NT>)[];
};

export interface RepeatingGroupExtensions {
  baseDataModelBindings?: IDataModelBindings;
}

export type RepeatingGroupLayoutComponent<NT extends NodeType = 'plain'> =
  RepeatingGroupExtensions & ComponentOf<NT>;

export type RepeatingGroupHierarchy<NT extends NodeType = 'plain'> = Omit<
  LayoutGroupHierarchy<NT>,
  'childComponents' | 'children'
> &
  RepeatingGroupExtensions & {
    rows: HierarchyWithRowsChildren<NT>[][];
  };

/**
 * Types of possible components on the top level of a repeating group hierarchy with rows
 */
export type HierarchyWithRows<NT extends NodeType = 'plain'> =
  | ComponentOf<NT>
  | LayoutGroupHierarchy<NT> // Non-repeating groups
  | RepeatingGroupHierarchy<NT>;

/**
 * Types of possible components inside rows. Note that no plain 'ILayoutComponent' is valid here,
 * as all components inside repeating group rows needs to have a baseComponentId, etc.
 */
export type HierarchyWithRowsChildren<NT extends NodeType = 'plain'> =
  | RepeatingGroupLayoutComponent<NT>
  | LayoutGroupHierarchy<NT> // Non-repeating groups
  | RepeatingGroupHierarchy<NT>;

export type AnyItem<NT extends NodeType = 'plain'> =
  | ComponentOf<NT>
  | GroupOf<NT>
  | RepeatingGroupLayoutComponent<NT>
  | LayoutGroupHierarchy<NT>
  | RepeatingGroupHierarchy<NT>;

export type AnyNode<NT extends NodeType = 'plain'> = LayoutNode<
  NT,
  AnyItem<NT>
>;

export type AnyParentItem<NT extends NodeType = 'plain'> = Exclude<
  AnyItem<NT>,
  ComponentOf<NT> | GroupOf<NT> | RepeatingGroupLayoutComponent<NT>
>;

export type AnyParentNode<NT extends NodeType = 'plain'> =
  | LayoutNode<NT>
  | LayoutRootNode<NT>;

export type AnyTopLevelItem<NT extends NodeType> = Exclude<
  AnyItem<NT>,
  GroupOf<NT>
>;

export type AnyTopLevelNode<NT extends NodeType> = LayoutNode<
  NT,
  AnyTopLevelItem<NT>
>;

export type AnyChildNode<NT extends NodeType> = LayoutNode<NT, AnyItem<NT>>;
