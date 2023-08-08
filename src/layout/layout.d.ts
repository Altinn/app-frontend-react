import type { TextField } from '@digdir/design-system-react';
import type { GridSize } from '@material-ui/core';
import type { UnionToIntersection } from 'utility-types';

import type { ExprVal } from 'src/features/expressions/types';
import type { ComponentConfigs, ComponentTypeConfigs } from 'src/layout/components.generated';
import type { CompGroupExternal } from 'src/layout/Group/config.generated';
import type { ILabelSettings, IMapping, IOption, IOptionSource, Triggers } from 'src/types';

export interface ILayouts {
  [id: string]: ILayout | undefined;
}

export interface ILayoutCompBase<Type extends ComponentTypes> {
  id: string;
  type: T;
  dataModelBindings?: IDataModelBindings<Type>;
  readOnly?: ExprVal.Boolean;
  renderAsSummary?: ExprVal.Boolean;
  required?: ExprVal.Boolean;
  hidden?: ExprVal.Boolean;
  textResourceBindings?: UnionToIntersection<TRBAsMap<Type, ExprVal.String>>;
  grid?: IGrid;
  triggers?: Triggers[];
  labelSettings?: ILabelSettings;
  pageBreak?: IPageBreak;
}

interface ISelectionComponent {
  options?: IOption[];
  optionsId?: string;
  mapping?: IMapping;
  secure?: boolean;
  source?: IOptionSource;
  preselectedOptionIndex?: number;
}

export type NumberFormatProps = Exclude<Parameters<typeof TextField>[0]['formatting'], undefined>['number'];

/**
 * Number formatting options. Will be reduced to react-number-format options:
 * @see useMapToReactNumberConfig
 */
export interface IInputFormatting {
  // Newer Intl.NumberFormat options
  currency?: string;
  unit?: string;
  position?: 'prefix' | 'suffix';

  // Older options based on react-number-format
  number?: NumberFormatProps;
  align?: 'right' | 'center' | 'left';
}

export interface ITableColumnFormatting<T extends ITableColumnProperties = ITableColumnProperties> {
  [key: string]: T;
}

export interface ITableColumnProperties {
  width?: string;
  alignText?: 'left' | 'center' | 'right';
  textOverflow?: {
    lineWrap?: boolean;
    maxHeight?: number;
  };
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

type InnerDMB<T extends ComponentTypes> = ComponentTypeConfigs[T]['nodeItem']['dataModelBindings'];

/**
 * This is the type you should use when referencing a specific component type, and will give
 * you the correct data model bindings for that component.
 */
export type IDataModelBindings<T extends ComponentTypes = ComponentTypes> =
  | UnionToIntersection<Exclude<InnerDMB<T>, undefined>>
  | undefined;

type InnerTRB<T extends ComponentTypes> = Exclude<
  ComponentTypeConfigs[T]['nodeItem']['textResourceBindings'],
  undefined
>;

type TRBAsMap<T extends ComponentTypes> = keyof InnerTRB<T> extends never ? undefined : Exclude<InnerTRB<T>, undefined>;

export type ITextResourceBindings<T extends ComponentTypes = ComponentTypes> =
  | UnionToIntersection<TRBAsMap<T, string>>
  | undefined;

export type ILayout = CompOrGroupExternal[];

export interface IGrid extends IGridStyling {
  labelGrid?: IGridStyling;
  innerGrid?: IGridStyling;
}

export interface IGridStyling {
  xs?: GridSize;
  sm?: GridSize;
  md?: GridSize;
  lg?: GridSize;
  xl?: GridSize;
}

export interface IPageBreak {
  breakBefore?: ExprVal.String; // 'auto' | 'always' | 'avoid'
  breakAfter?: ExprVal.String; // 'auto' | 'always' | 'avoid'
}
