import type { $Keys, PickByValue } from 'utility-types';

import type { IDevToolsState } from 'src/features/devtools/data/types';
import type { ContextDataSources } from 'src/features/expressions/ExprContext';
import type { ComponentClassMapTypes } from 'src/layout';
import type { ComponentCategory } from 'src/layout/common';
import type { ComponentTypeConfigs } from 'src/layout/components.generated';
import type { ComponentTypes, IDataModelBindings } from 'src/layout/layout';
import type { IValidations } from 'src/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

/**
 * These keys are not defined anywhere in the actual form layout files, but are added by the hierarchy.
 */
interface HierarchyExtensions {
  // These will be set if the component is inside a repeating group
  baseComponentId?: string;
  baseDataModelBindings?: IDataModelBindings;
  multiPageIndex?: number;
}

/**
 * Any item inside a hierarchy. Note that a LayoutNode _contains_ an item. The LayoutNode itself is an instance of the
 * LayoutNode class, while _an item_ is the object inside it that is somewhat similar to layout objects.
 */
type NodeItem<T extends ComponentTypes> = ComponentTypeConfigs[T]['nodeItem'];
export type AnyItem<T extends ComponentTypes = ComponentTypes> = NodeItem<T> & HierarchyExtensions;

/**
 * Any parent object of a LayoutNode (with for example repeating groups, the parent can be the group node, but above
 * that there will be a LayoutPage).
 */
export type ParentNode = LayoutNode | LayoutPage;

export type TypeFromAnyItem<T extends AnyItem> = T extends { type: infer Type }
  ? Type extends ComponentTypes
    ? Type
    : ComponentTypes
  : ComponentTypes;

export interface HierarchyDataSources extends ContextDataSources {
  validations: IValidations;
  devTools: IDevToolsState;
}

export type LayoutNodeFromObj<T> = T extends { type: infer Type }
  ? Type extends ComponentTypes
    ? LayoutNode<Type>
    : LayoutNode
  : LayoutNode;

export type TypesFromCategory<Type extends ComponentCategory> = $Keys<PickByValue<ComponentClassMapTypes, Type>>;

export type LayoutNodeFromCategory<Type> = Type extends ComponentCategory
  ? LayoutNode<TypesFromCategory<Type>>
  : LayoutNode;
