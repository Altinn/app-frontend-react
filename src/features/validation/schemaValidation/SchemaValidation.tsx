import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import dot from 'dot-object';
import type Ajv from 'ajv';
import type { JSONSchema7 } from 'json-schema';

import { FrontendValidationSource } from '..';
import type { FieldValidation, FieldValidations } from '..';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { dotNotationToPointer } from 'src/features/datamodel/notations';
import { lookupPathInSchema } from 'src/features/datamodel/SimpleSchemaTraversal';
import { useDataModelType } from 'src/features/datamodel/useBindingSchema';
import { FD } from 'src/features/formData/FormDataWrite';
import {
  createValidator,
  getErrorCategory,
  getErrorParams,
  getErrorTextKey,
} from 'src/features/validation/schemaValidation/schemaValidationUtils';
import { Validation } from 'src/features/validation/validationContext';
import { getRootElementPath } from 'src/utils/schemaUtils';
import type { TextReference } from 'src/features/language/useLanguage';

export const VALIDATION_TIMEOUT = 10;

export function SchemaValidation({ dataType }: { dataType: string }) {
  const updateDataModelValidations = Validation.useUpdateDataModelValidations();

  const formData = FD.useDebounced(dataType);
  const schema = DataModels.useDataModelSchema(dataType);
  const dataTypeDef = useDataModelType(dataType);
  const dataElementId = DataModels.useDataElementIdForDataType(dataType) ?? dataType; // stateless does not have dataElementId

  const fields = Object.keys(dot.dot(formData)).filter((field) => !field.endsWith('altinnRowId'));

  /**
   * Create a validator for the current schema and data type.
   */
  const [validator, rootElementPath] = useMemo(() => {
    if (!schema || !dataTypeDef) {
      return [undefined, undefined] as const;
    }

    return [createValidator(schema), getRootElementPath(schema, dataTypeDef)] as const;
  }, [schema, dataTypeDef]);

  const allValidations = useRef<FieldValidations>({});
  const updateTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const updateFieldValidations = useCallback(
    (field: string, validations: FieldValidation[] | null) => {
      if (validations) {
        allValidations.current[field] = validations;
      } else {
        delete allValidations.current[field];
      }
      clearTimeout(updateTimeout.current);
      updateTimeout.current = setTimeout(
        () => updateDataModelValidations('schema', dataElementId, structuredClone(allValidations.current)),
        VALIDATION_TIMEOUT,
      );
    },
    [dataElementId, updateDataModelValidations],
  );

  return (
    <>
      {validator &&
        fields.map((field) => (
          <SchemaFieldValidation
            key={field}
            field={field}
            dataType={dataType}
            dataElementId={dataElementId}
            validator={validator}
            schema={schema}
            rootElementPath={rootElementPath}
            updateFieldValidations={updateFieldValidations}
          />
        ))}
    </>
  );
}

function SchemaFieldValidation({
  field,
  dataType,
  dataElementId,
  validator,
  schema,
  rootElementPath,
  updateFieldValidations,
}: {
  field: string;
  dataType: string;
  dataElementId: string;
  validator: Ajv;
  schema: JSONSchema7;
  rootElementPath: string;
  updateFieldValidations: (field: string, fieldValidations: FieldValidation[] | null) => void;
}) {
  const data = FD.useDebouncedPick({ field, dataType });

  const targetPointer = dotNotationToPointer(field);
  const [schemaPath, subSchema] = useMemo(
    () => lookupPathInSchema({ rootElementPath, schema, targetPointer }),
    [rootElementPath, schema, targetPointer],
  );

  // Remove validation if field disappears
  useEffect(() => () => updateFieldValidations(field, null), [updateFieldValidations, field]);

  useEffect(() => {
    if (!schemaPath || !subSchema) {
      // Field not found in schema, ignore it
      return;
    }

    if (data == null || data === '') {
      updateFieldValidations(field, null);
      return;
    }

    const valid = validator.validate(`schema#${schemaPath}`, data);
    const validations: FieldValidation[] = [];
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
         * Get TextReference for error message.
         * Either a standardized language key or a custom error message from the schema.
         */
        const message: TextReference =
          'errorMessage' in subSchema && typeof subSchema.errorMessage === 'string'
            ? { key: subSchema.errorMessage }
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
          field,
          dataElementId,
          source: FrontendValidationSource.Schema,
          category,
          severity: 'error',
        });
      }
    }

    updateFieldValidations(field, validations?.length ? validations : null);
  }, [data, dataElementId, field, schemaPath, schema, subSchema, updateFieldValidations, validator]);

  return null;
}
