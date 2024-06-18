import { useEffect } from 'react';

import { FrontendValidationSource, ValidationMask } from '..';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { FD } from 'src/features/formData/FormDataWrite';
import { Validation } from 'src/features/validation/validationContext';
import { useAsRef } from 'src/hooks/useAsRef';
import { getKeyWithoutIndex } from 'src/utils/databindings';
import { useNodes } from 'src/utils/layout/NodesContext';
import type { ExprConfig, Expression } from 'src/features/expressions/types';
import type { IDataModelReference, ILayoutSet } from 'src/layout/common.generated';
import type { HierarchyDataSources } from 'src/layout/layout';

const EXPR_CONFIG: ExprConfig<ExprVal.Boolean> = {
  defaultValue: false,
  returnType: ExprVal.Boolean,
  resolvePerRow: false,
};

export function ExpressionValidation({ dataType }: { dataType: string }) {
  const updateDataModelValidations = Validation.useUpdateDataModelValidations();
  const formData = FD.useDebounced(dataType);
  const expressionValidationConfig = DataModels.useExpressionValidationConfig(dataType);
  const nodesRef = useAsRef(useNodes());

  useEffect(() => {
    if (expressionValidationConfig && Object.keys(expressionValidationConfig).length > 0 && formData) {
      const validations = {};

      for (const node of nodesRef.current.allNodes()) {
        if (!node.item.dataModelBindings) {
          continue;
        }

        // Modify the hierarchy data sources to make the current dataModel the default one when running expression validations
        const currentLayoutSet = node.getDataSources().currentLayoutSet;
        const modifiedCurrentLayoutSet: ILayoutSet | null = currentLayoutSet
          ? {
              ...currentLayoutSet,
              dataType,
            }
          : null;
        const dataSources: HierarchyDataSources = {
          ...node.getDataSources(),
          currentLayoutSet: modifiedCurrentLayoutSet,
        };

        for (const reference of Object.values(node.item.dataModelBindings as Record<string, IDataModelReference>)) {
          if (reference.dataType !== dataType) {
            continue;
          }

          const field = reference.field;

          /**
           * Should not run validations on the same field multiple times
           */
          if (validations[field]) {
            continue;
          }

          const baseField = getKeyWithoutIndex(field);
          const validationDefs = expressionValidationConfig[baseField];
          if (!validationDefs) {
            continue;
          }

          for (const validationDef of validationDefs) {
            const isInvalid = evalExpr(validationDef.condition as Expression, node, dataSources, {
              config: EXPR_CONFIG,
              positionalArguments: [field],
            });
            if (isInvalid) {
              if (!validations[field]) {
                validations[field] = [];
              }

              validations[field].push({
                field,
                source: FrontendValidationSource.Expression,
                message: { key: validationDef.message },
                severity: validationDef.severity,
                category: validationDef.showImmediately ? 0 : ValidationMask.Expression,
              });
            }
          }
        }
      }

      updateDataModelValidations('expression', dataType, validations);
    }
  }, [expressionValidationConfig, nodesRef, formData, dataType, updateDataModelValidations]);

  return null;
}
