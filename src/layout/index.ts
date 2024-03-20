import type { MutableRefObject } from 'react';

import { ComponentConfigs } from 'src/layout/components.generated';
import type { DisplayData } from 'src/features/displayData';
import type { BaseValidation, ComponentValidation, ValidationDataSources } from 'src/features/validation';
import type { IGenericComponentProps } from 'src/layout/GenericComponent';
import type { CompInternal, CompRendersLabel, CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export type CompClassMap = {
  [K in keyof typeof ComponentConfigs]: (typeof ComponentConfigs)[K]['def'];
};

export type CompClassMapTypes = {
  [K in keyof CompClassMap]: CompClassMap[K]['type'];
};

export type CompDef<T extends CompTypes = CompTypes> = (typeof ComponentConfigs)[T]['def'];

export type MinimalItem<T extends CompInternal> = Pick<T, 'id' | 'baseComponentId' | 'type' | 'multiPageIndex'>;

/**
 * A nodeRef represents a reference to a node in the layout tree. It is used to reference a specific node,
 * and you can use it to find the node in the layout tree via hooks and utilities like:
 * @see useNodeRef
 * @see useNodeRefSelector
 * @see isNodeRef
 */
export interface NodeRef {
  nodeRef: string;
}

export interface IComponentProps {
  containerDivRef: MutableRefObject<HTMLDivElement | null>;
  isValid?: boolean;
}

export interface PropsFromGenericComponent<T extends CompTypes = CompTypes> extends IComponentProps {
  node: LayoutNode<T>;
  overrideItemProps?: Partial<Omit<CompInternal<T>, 'id'>>;
  overrideDisplay?: IGenericComponentProps<T>['overrideDisplay'];
}

export function getLayoutComponentObject<T extends keyof CompClassMap>(type: T): CompClassMap[T] {
  if (type && type in ComponentConfigs) {
    return ComponentConfigs[type as keyof typeof ComponentConfigs].def as any;
  }
  return undefined as any;
}

export function shouldComponentRenderLabel<T extends CompTypes>(type: T): CompRendersLabel<T> {
  return ComponentConfigs[type].rendersWithLabel;
}

type TypeFromDef<Def extends CompDef> = Def extends CompDef<infer T> ? T : CompTypes;

export function implementsAnyValidation<Def extends CompDef>(
  def: Def,
): def is Def & (ValidateEmptyField<TypeFromDef<Def>> | ValidateComponent<TypeFromDef<Def>>) {
  return 'runEmptyFieldValidation' in def || 'runComponentValidation' in def;
}

export interface ValidateEmptyField<Type extends CompTypes> {
  runEmptyFieldValidation: (
    node: LayoutNode<Type>,
    item: CompInternal<Type>,
    validationContext: ValidationDataSources,
  ) => ComponentValidation[];
}

export function implementsValidateEmptyField<Def extends CompDef>(
  def: Def,
): def is Def & ValidateEmptyField<TypeFromDef<Def>> {
  return 'runEmptyFieldValidation' in def;
}

export interface ValidateComponent<Type extends CompTypes> {
  runComponentValidation: (
    node: LayoutNode,
    item: CompInternal<Type>,
    validationContext: ValidationDataSources,
  ) => ComponentValidation[];
}

export function implementsValidateComponent<Def extends CompDef>(
  def: Def,
): def is Def & ValidateComponent<TypeFromDef<Def>> {
  return 'runComponentValidation' in def;
}

export type ValidationFilterFunction = (
  validation: BaseValidation,
  index: number,
  validations: BaseValidation[],
) => boolean;

export interface ValidationFilter {
  getValidationFilters: (node: LayoutNode) => ValidationFilterFunction[];
}

export type FormDataSelector = (path: string, postProcessor?: (data: unknown) => unknown) => unknown;

export function implementsValidationFilter<Def extends CompDef>(def: Def): def is Def & ValidationFilter {
  return 'getValidationFilters' in def;
}

export function implementsDisplayData<Def extends CompDef>(def: Def): def is Def & DisplayData<TypeFromDef<Def>> {
  return 'getDisplayData' in def && 'useDisplayData' in def;
}
