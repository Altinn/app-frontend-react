import type { FieldValidations, ValidationEntry } from 'src/features/validation/types';

export enum FrontendValidationSource {
  Required = '__required__',
  Schema = '__schema__',
  Component = '__component',
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
