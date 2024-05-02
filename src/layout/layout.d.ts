import type { $Keys, PickByValue } from 'utility-types';

import type { ComponentBehaviors, ComponentCapabilities } from 'src/codegen/ComponentConfig';
import type { DevToolsHiddenComponents } from 'src/features/devtools/data/types';
import type { ContextDataSources } from 'src/features/expressions/ExprContext';
import type { CompCategory } from 'src/layout/common';
import type { ILayoutFileExternal } from 'src/layout/common.generated';
import type { ComponentConfigs, ComponentTypeConfigs } from 'src/layout/components.generated';
import type { CompGroupExternal } from 'src/layout/Group/config.generated';
import type { CompClassMapCategories } from 'src/layout/index';
import type {
  ActionComponent,
  ContainerComponent,
  FormComponent,
  PresentationComponent,
} from 'src/layout/LayoutComponent';
import type { CompLikertExternal } from 'src/layout/Likert/config.generated';
import type { CompRepeatingGroupExternal } from 'src/layout/RepeatingGroup/config.generated';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export interface ILayouts {
  [id: string]: ILayout | undefined;
}

/**
 * This interface type defines all the possible components, along with their 'type' key and associated layout
 * definition. If you want to reference a particular component layout type you can either reference the individual
 * type (ex. ILayoutCompTextArea), or ILayoutComponent<'TextArea'>.
 */

export type CompTypes = keyof typeof ComponentConfigs & keyof ComponentTypeConfigs;
type AllComponents = ComponentTypeConfigs[CompTypes]['layout'];

export type CompExceptGroup = Exclude<CompTypes, 'Group', 'RepeatingGroup', 'Likert'>;

/**
 * This type can be used to reference the layout declaration for a component. You can either use it to specify
 * any valid component:
 *
 *  const myComponent:CompExternal = ...
 *
 * Or a component of a specific known type (gives you more valid options):
 *
 *  const myImageComponent:CompExternal<'Image'> = ...
 *
 * @see CompInternal
 * @see LayoutNode
 */
export type CompExternal<Type extends CompExceptGroup = CompExceptGroup> = Extract<AllComponents, { type: Type }>;

/**
 * Alternative version of the one above
 */
export type CompExternalExact<Type extends CompTypes> = ComponentTypeConfigs[Type]['layout'];

export type CompOrGroupExternal = CompRepeatingGroupExternal | CompLikertExternal | CompGroupExternal | CompExternal;

/**
 * This is the type you should use when referencing a specific component type, and will give
 * you the correct data model bindings for that component.
 */
export type IDataModelBindings<T extends CompTypes = CompTypes> = Exclude<
  CompInternal<T>['dataModelBindings'],
  undefined
>;

export type ITextResourceBindingsExternal<T extends CompTypes = CompTypes> =
  ComponentTypeConfigs[T]['layout']['textResourceBindings'];

export type ITextResourceBindings<T extends CompTypes = CompTypes> = CompInternal<T>['textResourceBindings'];

export type ILayout = CompOrGroupExternal[];

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
type NodeItem<T extends CompTypes> = ReturnType<(typeof ComponentConfigs)[T]['def']['evalExpressions']>;

export type CompInternal<T extends CompTypes = CompTypes> = NodeItem<T> & HierarchyExtensions;

/**
 * Any parent object of a LayoutNode (with for example repeating groups, the parent can be the group node, but above
 * that there will be a LayoutPage).
 */
export type ParentNode = LayoutNode | LayoutPage;

export type TypeFromConfig<T extends CompInternal | CompExternal> = T extends { type: infer Type }
  ? Type extends CompTypes
    ? Type
    : CompTypes
  : CompTypes;

export type TypeFromNode<N extends LayoutNode> = N extends BaseLayoutNode<infer Type> ? Type : CompTypes;

export interface HierarchyDataSources extends ContextDataSources {
  devToolsIsOpen: boolean;
  devToolsHiddenComponents: DevToolsHiddenComponents;
}

export type LayoutNodeFromObj<T> = T extends { type: infer Type }
  ? Type extends CompTypes
    ? LayoutNode<Type>
    : LayoutNode
  : LayoutNode;

export type TypesFromCategory<Cat extends CompCategory> = $Keys<PickByValue<CompClassMapCategories, Cat>>;

export type CompWithPlugin<Plugin> = {
  [Type in CompTypes]: Extract<ComponentTypeConfigs[Type]['plugins'], Plugin> extends never ? never : Type;
}[CompTypes];

export type DefFromCategory<C extends CompCategory> = C extends 'presentation'
  ? PresentationComponent<any>
  : C extends 'form'
    ? FormComponent<any>
    : C extends 'action'
      ? ActionComponent<any>
      : C extends 'container'
        ? ContainerComponent<any>
        : never;

export type LayoutNodeFromCategory<Type> = Type extends CompCategory ? LayoutNode<TypesFromCategory<Type>> : LayoutNode;

export type ILayoutCollection = { [pageName: string]: ILayoutFileExternal };

export type IsContainerComp<T extends CompTypes> = ComponentTypeConfigs[T]['category'] extends CompCategory.Container
  ? true
  : false;

export type IsActionComp<T extends CompTypes> = ComponentTypeConfigs[T]['category'] extends CompCategory.Action
  ? true
  : false;

export type IsFormComp<T extends CompTypes> = ComponentTypeConfigs[T]['category'] extends CompCategory.Form
  ? true
  : false;

export type IsPresentationComp<T extends CompTypes> =
  ComponentTypeConfigs[T]['category'] extends CompCategory.Presentation ? true : false;

export type CompWithCap<Capability extends keyof ComponentCapabilities> = {
  [Type in CompTypes]: (typeof ComponentConfigs)[Type]['capabilities'][Capability] extends true ? Type : never;
}[CompTypes];

export type CompWithBehavior<Behavior extends keyof ComponentBehaviors> = {
  [Type in CompTypes]: (typeof ComponentConfigs)[Type]['behaviors'][Behavior] extends true ? Type : never;
}[CompTypes];
