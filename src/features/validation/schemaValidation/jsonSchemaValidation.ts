import type { ErrorObject } from 'ajv';

import {
  type ComponentValidation,
  FrontendValidationSource,
  type SchemaValidationDataSources,
  ValidationMask,
} from '..';

import { type GetSchemaValidator } from 'src/features/datamodel/DataModelsProvider';
import {
  getErrorCategory,
  getErrorParams,
  getErrorTextKey,
} from 'src/features/validation/schemaValidation/schemaValidationUtils';
import type { TextReference } from 'src/features/language/useLanguage';
import type { FormDataRowsSelector, FormDataSelector } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { CompTypes, CompWithBinding } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function runSchemaValidationAllBindings<Type extends CompTypes>(
  node: LayoutNode<Type>,
  { formDataSelector, nodeDataSelector, getSchemaValidator }: SchemaValidationDataSources,
  filter?: (error: ErrorObject) => boolean,
): ComponentValidation[] {
  const dataModelBindings = nodeDataSelector((picker) => picker(node)?.layout.dataModelBindings, [node]);
  if (!dataModelBindings) {
    return [];
  }
  const validations: ComponentValidation[] = [];

  for (const [bindingKey, reference] of Object.entries(dataModelBindings as Record<string, IDataModelReference>)) {
    validations.push(
      ...validateFieldAgainstSchema(bindingKey, reference, getSchemaValidator, formDataSelector, filter),
    );
  }

  return validations;
}

export function runSchemaValidationOnlySimpleBinding<Type extends CompWithBinding<'simpleBinding'>>(
  node: LayoutNode<Type>,
  { formDataSelector, nodeDataSelector, getSchemaValidator }: SchemaValidationDataSources,
  filter?: (error: ErrorObject) => boolean,
): ComponentValidation[] {
  const reference = nodeDataSelector((picker) => picker(node)?.layout.dataModelBindings.simpleBinding, [node]);
  if (!reference) {
    return [];
  }

  return validateFieldAgainstSchema('simpleBinding', reference, getSchemaValidator, formDataSelector, filter);
}

/**
 * Custom light-weight implementation for validating list count without validating child fields
 */
export function validateListCountAgainstSchema(
  bindingKey: string,
  { field, dataType }: IDataModelReference,
  getSchemaValidator: GetSchemaValidator,
  formDataRowsSelector: FormDataRowsSelector,
  // Skip min/max can be set to avoid duplicate validations from schema
  skipMinimum = false,
  skipMaxmimum = false,
) {
  if (skipMinimum && skipMaxmimum) {
    return [];
  }

  const { lookupTool } = getSchemaValidator(dataType);
  const data = formDataRowsSelector({ field, dataType });
  const [resolvedSchema] = lookupTool.getSchemaForPath(field);
  if (!resolvedSchema) {
    return [];
  }

  const validations: ComponentValidation[] = [];
  const length = data?.length ?? 0;

  if (!skipMinimum && resolvedSchema.minItems && length < resolvedSchema.minItems) {
    validations.push({
      message: { key: 'validation_errors.minItems', params: [resolvedSchema.minItems] },
      severity: 'error',
      bindingKey,
      source: FrontendValidationSource.Schema,
      // Treat visibility of minCount the same as required to prevent showing an error immediately
      category: ValidationMask.Required,
    });
  }

  if (!skipMaxmimum && resolvedSchema.maxItems && length > resolvedSchema.maxItems) {
    validations.push({
      message: { key: 'validation_errors.maxItems', params: [resolvedSchema.maxItems] },
      severity: 'error',
      bindingKey,
      source: FrontendValidationSource.Schema,
      // Treat visibility of minCount the same as required to prevent showing an error immediately
      category: ValidationMask.Schema,
    });
  }

  return validations;
}

export function validateFieldAgainstSchema(
  bindingKey: string,
  { field, dataType }: IDataModelReference,
  getSchemaValidator: GetSchemaValidator,
  formDataSelector: FormDataSelector,
  filter?: (error: ErrorObject) => boolean,
) {
  const validations: ComponentValidation[] = [];

  const { lookupTool, validator } = getSchemaValidator(dataType);
  const schemaPath = lookupTool.getSchemaPathForDataModelPath(field);
  if (!schemaPath) {
    return validations;
  }

  const data = formDataSelector({ field, dataType });
  if (data == null || data === '') {
    return validations;
  }

  const valid = validator.validate(`schema#${schemaPath}`, structuredClone(data));
  if (!valid) {
    for (const error of validator.errors ?? []) {
      /**
       * Check if AVJ validation error is a oneOf error ("must match exactly one schema in oneOf").
       * We don't currently support oneOf validation.
       * These can be ignored, as there will be other, specific validation errors that actually
       * from the specified sub-schemas that will trigger validation errors where relevant.
       */
      if (error.keyword === 'oneOf') {
        continue;
      }

      /**
       * We only want to include errors for the specific field, not child fields. These should
       * be handled by child components.
       */
      if (error.instancePath !== '/') {
        continue;
      }

      if (filter && !filter(error)) {
        continue;
      }

      /**
       * Get TextReference for error message.
       * Either a standardized language key or a custom error message from the schema.
       */
      const message: TextReference =
        error.parentSchema &&
        'errorMessage' in error.parentSchema &&
        typeof error.parentSchema.errorMessage === 'string'
          ? { key: error.parentSchema.errorMessage }
          : {
              key: getErrorTextKey(error),
            };

      const category = getErrorCategory(error);

      /**
       * Extract error parameters and add to message if available.
       */
      const errorParams = getErrorParams(error);
      if (errorParams !== null) {
        message['params'] = [errorParams];
      }

      validations.push({
        message,
        bindingKey,
        source: FrontendValidationSource.Schema,
        category,
        severity: 'error',
      });
    }
  }
  return validations;
}
