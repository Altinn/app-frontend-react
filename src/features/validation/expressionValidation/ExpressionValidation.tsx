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
import type { IDataModelReference } from 'src/layout/common.generated';

const EXPR_CONFIG: ExprConfig<ExprVal.Boolean> = {
  defaultValue: false,
  returnType: ExprVal.Boolean,
  resolvePerRow: false,
};

export function ExpressionValidation({ dataType }: { dataType: string }) {
  const updateValidations = Validation.useUpdateValidations();
  const formData = FD.useDebounced(dataType);
  const expressionValidationConfig = DataModels.useExpressionValidationConfig(dataType);
  const nodesRef = useAsRef(useNodes());

  useEffect(() => {
    if (expressionValidationConfig && Object.keys(expressionValidationConfig).length > 0 && formData) {
      const validations = { [dataType]: {} };

      for (const node of nodesRef.current.allNodes()) {
        if (!node.item.dataModelBindings) {
          continue;
        }

        for (const reference of Object.values(node.item.dataModelBindings as Record<string, IDataModelReference>)) {
          if (reference.dataType !== dataType) {
            continue;
          }

          const field = reference.property;

          /**
           * Should not run validations on the same field multiple times
           */
          if (validations[dataType][field]) {
            continue;
          }

          const baseField = getKeyWithoutIndex(field);
          const validationDefs = expressionValidationConfig[baseField];
          if (!validationDefs) {
            continue;
          }

          for (const validationDef of validationDefs) {
            const isInvalid = evalExpr(validationDef.condition as Expression, node, node.getDataSources(), {
              config: EXPR_CONFIG,
              positionalArguments: [field, dataType],
            });
            if (isInvalid) {
              if (!validations[dataType][field]) {
                validations[dataType][field] = [];
              }

              validations[dataType][field].push({
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

      updateValidations('expression', validations);
    }

    // Cleanup function
    return () => updateValidations('expression', { [dataType]: {} });
  }, [expressionValidationConfig, nodesRef, formData, dataType, updateValidations]);

  return null;
}
