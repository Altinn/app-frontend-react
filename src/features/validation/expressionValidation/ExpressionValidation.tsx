import React, { useEffect, useMemo, useState } from 'react';

import { FrontendValidationSource, ValidationMask } from '..';
import type { FieldValidations, IExpressionValidation } from '..';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { FD } from 'src/features/formData/FormDataWrite';
import { Validation } from 'src/features/validation/validationContext';
import { NestedDataModelLocationProviders } from 'src/utils/layout/DataModelLocation';
import { useExpressionDataSources } from 'src/utils/layout/useExpressionDataSources';
import type { ExprValToActualOrExpr, ExprValueArgs } from 'src/features/expressions/types';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { ExpressionDataSources } from 'src/utils/layout/useExpressionDataSources';

// This collects single-field validation updates to store in a big object containing all expression field validations
// for a given data type.
type ValidationCollectorApi = {
  setFieldValidations: (fieldKey: string, validations: FieldValidations[string]) => void;
};

export function ExpressionValidation() {
  const writableDataTypes = DataModels.useWritableDataTypes();

  return (
    <>
      {writableDataTypes.map((dataType) => (
        <DataTypeValidation
          key={dataType}
          dataType={dataType}
        />
      ))}
    </>
  );
}

function DataTypeValidation({ dataType }: { dataType: string }) {
  const updateDataModelValidations = Validation.useUpdateDataModelValidations();
  const dataElementId = DataModels.useDataElementIdForDataType(dataType);
  const expressionValidationConfig = DataModels.useExpressionValidationConfig(dataType);

  const [allFieldValidations, setAllFieldValidations] = useState<FieldValidations>({});
  const collector: ValidationCollectorApi = {
    setFieldValidations: (fieldKey, validations) => {
      setAllFieldValidations((prev) => ({ ...prev, [fieldKey]: validations }));
    },
  };

  useEffect(() => {
    if (!dataElementId) {
      return;
    }

    updateDataModelValidations('expression', dataElementId, allFieldValidations);
  }, [allFieldValidations, updateDataModelValidations, dataElementId]);

  if (!dataElementId || !expressionValidationConfig) {
    return null;
  }

  return (
    <>
      {Object.keys(expressionValidationConfig).map((field) => (
        <BaseFieldExpressionValidation
          key={`${dataType}-${field}`}
          dataType={dataType}
          dataElementId={dataElementId}
          validationDefs={expressionValidationConfig[field]}
          baseFieldReference={{ dataType, field }}
          collector={collector}
        />
      ))}
    </>
  );
}

function BaseFieldExpressionValidation({
  dataType,
  dataElementId,
  validationDefs,
  baseFieldReference,
  collector,
}: {
  dataType: string;
  dataElementId: string;
  validationDefs: IExpressionValidation[];
  baseFieldReference: IDataModelReference;
  collector: ValidationCollectorApi;
}) {
  const actualFieldPaths = FD.useDebouncedAllPaths(baseFieldReference);

  return (
    <>
      {actualFieldPaths.map((fieldPath) => {
        const reference = { dataType: baseFieldReference.dataType, field: fieldPath };
        return (
          <NestedDataModelLocationProviders
            key={fieldPath}
            reference={reference}
          >
            <FieldExpressionValidation
              dataType={dataType}
              dataElementId={dataElementId}
              reference={reference}
              validationDefs={validationDefs}
              collector={collector}
            />
          </NestedDataModelLocationProviders>
        );
      })}
    </>
  );
}

function FieldExpressionValidation({
  dataType,
  dataElementId,
  reference,
  validationDefs,
  collector,
}: {
  dataType: string;
  dataElementId: string;
  reference: IDataModelReference;
  validationDefs: IExpressionValidation[];
  collector: ValidationCollectorApi;
}) {
  const fieldData = FD.useDebouncedPick(reference);
  const baseDataSources = useExpressionDataSources(validationDefs);
  const dataSources: ExpressionDataSources = useMemo(
    () => ({
      ...baseDataSources,
      defaultDataType: dataType,
    }),
    [baseDataSources, dataType],
  );

  useEffect(() => {
    const field = reference.field;

    const validations: FieldValidations[string] = [];

    for (const validationDef of validationDefs) {
      const valueArguments: ExprValueArgs<{ field: string }> = { data: { field }, defaultKey: 'field' };
      const isInvalid = evalExpr(validationDef.condition as ExprValToActualOrExpr<ExprVal.Boolean>, dataSources, {
        returnType: ExprVal.Boolean,
        defaultValue: false,
        positionalArguments: [field],
        valueArguments,
      });
      const evaluatedMessage = evalExpr(validationDef.message, dataSources, {
        returnType: ExprVal.String,
        defaultValue: '',
        positionalArguments: [field],
        valueArguments,
      });

      if (isInvalid) {
        validations.push({
          field,
          dataElementId,
          source: FrontendValidationSource.Expression,
          message: { key: evaluatedMessage },
          severity: validationDef.severity,
          category: validationDef.showImmediately ? 0 : ValidationMask.Expression,
        });
      }
    }

    collector.setFieldValidations(reference.field, validations);
  }, [collector, validationDefs, fieldData, dataElementId, dataSources, reference, dataType]);

  return null;
}
