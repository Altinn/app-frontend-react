import type { ComponentConfigs, ComponentTypeConfigs } from 'src/layout/components.generated';
import type { CompGroupExternal } from 'src/layout/Group/config.generated';

export interface ILayouts {
  [id: string]: ILayout | undefined;
}

/**
 * This interface type defines all the possible components, along with their 'type' key and associated layout
 * definition. If you want to reference a particular component layout type you can either reference the individual
 * type (ex. ILayoutCompTextArea), or ILayoutComponent<'TextArea'>.
 */

export type ComponentTypes = keyof typeof ComponentConfigs & keyof ComponentTypeConfigs;
type AllComponents = ComponentTypeConfigs[ComponentTypes]['layout'];

export type ComponentExceptGroup = Exclude<ComponentTypes, 'Group'>;

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
 * @see AnyItem
 * @see LayoutNode
 */
export type CompExternal<Type extends ComponentExceptGroup = ComponentExceptGroup> = Extract<
  AllComponents,
  { type: Type }
>;

/**
 * Alternative version of the one above
 */
export type CompExternalExact<Type extends ComponentTypes> = ComponentTypeConfigs[Type]['layout'];

export type CompOrGroupExternal = CompGroupExternal | CompExternal;

export type ComponentRendersLabel<T extends ComponentTypes> = (typeof ComponentConfigs)[T]['rendersWithLabel'];

/**
 * This is the type you should use when referencing a specific component type, and will give
 * you the correct data model bindings for that component.
 */
export type IDataModelBindings<T extends ComponentTypes = ComponentTypes> =
  ComponentTypeConfigs[T]['nodeItem']['dataModelBindings'];

export type ITextResourceBindings<T extends ComponentTypes = ComponentTypes> =
  ComponentTypeConfigs[T]['nodeItem']['textResourceBindings'];

export type ILayout = CompOrGroupExternal[];
