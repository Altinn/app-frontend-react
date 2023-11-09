import type { FieldValidations, FrontendValidation, ValidationEntry } from 'src/features/validation/types';
import type { IDataModelBindings } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ValidationSeverity } from 'src/utils/validation/types';

export enum FrontendValidationSource {
  Required = '__required__',
  Schema = '__schema__',
  Component = '__component__',
  Expression = '__expression__',
}

/**
 * Initializes a validation group for a field
 * This must be done for all fields that will be validated
 * before adding any validations to it.
 */
export function initializeValidationField(dest: FieldValidations, field: string, group: string): void {
  if (dest[field]?.[group]) {
    window.logError(
      `Initializing validation failed, group ${group} already exists on field ${field}\n`,
      dest[field][group],
    );
    return;
  }

  if (!dest[field]) {
    dest[field] = { [group]: [] };
  } else {
    dest[field][group] = [];
  }
}

/**
 * Adds a validation to a fieldValidations object
 * Logs a warning if field and group are not found,
 * as these will need to be initialized as empty in order
 * to be able to remove the validation in case it does not return an error.
 */
export function addValidationToField(dest: FieldValidations, validation: ValidationEntry): void {
  if (!dest[validation.field]) {
    window.logError('Adding validation failed, field object was not initialized\n', validation);
    return;
  }
  if (!dest[validation.field][validation.group]) {
    window.logError('Adding validation failed, group object was not initialized\n', validation);
    return;
  }
  dest[validation.field][validation.group].push(validation);
}

export function validationsOfSeverity<Severity extends ValidationSeverity>(
  validations: FrontendValidation<ValidationSeverity>[] | undefined,
  severity: Severity,
): FrontendValidation<Severity>[];
export function validationsOfSeverity<Severity extends ValidationSeverity>(
  validations: ValidationEntry<ValidationSeverity>[] | undefined,
  severity: Severity,
): ValidationEntry<Severity>[];
export function validationsOfSeverity(validations: any, severity: any) {
  return validations?.filter((validation: any) => validation.severity === severity) ?? [];
}

export function hasValidationErrors(validations: FrontendValidation<ValidationSeverity>[] | undefined): boolean;
export function hasValidationErrors(validations: ValidationEntry<ValidationSeverity>[] | undefined): boolean;
export function hasValidationErrors(validations: any): boolean {
  return validations?.some((validation: any) => validation.severity === 'errors') ?? false;
}

export function buildFrontendValidation<Severity extends ValidationSeverity = ValidationSeverity>(
  node: LayoutNode,
  bindingKey: string,
  validation: ValidationEntry<Severity>,
): FrontendValidation<Severity> {
  return {
    ...validation,
    bindingKey,
    componentId: node.item.id,
    pageKey: node.pageKey(),
  };
}

export function validationsForBindings<DataModelBindings extends NonNullable<IDataModelBindings>>(
  validations: FrontendValidation[] | undefined,
  dataModelBindings: DataModelBindings | undefined,
): { [binding in keyof DataModelBindings]: FrontendValidation[] } {
  return Object.fromEntries(
    Object.entries(dataModelBindings ?? {}).map(([binding, field]) => [
      binding,
      validations?.filter((v) => v.field === field) ?? [],
    ]),
  ) as any;
}
