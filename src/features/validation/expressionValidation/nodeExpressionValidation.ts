import {
  type ComponentValidation,
  type ExpressionValidationDataSources,
  FrontendValidationSource,
  ValidationMask,
} from '..';

import { evalExpr } from 'src/features/expressions';
import { getKeyWithoutIndex } from 'src/utils/databindings';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function runExpressionValidationAllBindings<Type extends CompTypes>(
  node: LayoutNode<Type>,
  { expressionDataSources, getExpressionValidationConfig }: ExpressionValidationDataSources,
) {
  const dataModelBindings = expressionDataSources.nodeDataSelector(
    (picker) => picker(node)?.layout.dataModelBindings,
    [node],
  );
  if (!dataModelBindings) {
    return [];
  }

  const validations: ComponentValidation[] = [];

  for (const [bindingKey, { dataType, field }] of Object.entries(
    dataModelBindings as Record<string, IDataModelReference>,
  )) {
    const config = getExpressionValidationConfig(dataType);
    if (!config) {
      continue;
    }

    const baseField = getKeyWithoutIndex(field);
    const validationDefs = config[baseField];
    if (!validationDefs) {
      continue;
    }

    for (const validationDef of validationDefs) {
      const isInvalid = evalExpr(validationDef.condition, node, expressionDataSources, {
        positionalArguments: [field],
        defaultDataType: dataType,
      });

      if (isInvalid) {
        validations.push({
          bindingKey,
          source: FrontendValidationSource.Expression,
          message: { key: validationDef.message },
          severity: validationDef.severity,
          category: validationDef.showImmediately ? 0 : ValidationMask.Expression,
        });
      }
    }
  }

  return validations;
}
