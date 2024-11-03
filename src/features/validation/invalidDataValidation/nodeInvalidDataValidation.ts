import {
  type ComponentValidation,
  FrontendValidationSource,
  type InvalidDataValidationDataSources,
  ValidationMask,
} from '..';

import type { IDataModelReference } from 'src/layout/common.generated';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

function isScalar(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

export function runInvalidDataValidationAllBindings<Type extends CompTypes>(
  node: LayoutNode<Type>,
  { invalidDataSelector, nodeDataSelector }: InvalidDataValidationDataSources,
): ComponentValidation[] {
  const dataModelBindings = nodeDataSelector((picker) => picker(node)?.layout.dataModelBindings, [node]);
  if (!dataModelBindings) {
    return [];
  }

  const validations: ComponentValidation[] = [];

  for (const [bindingKey, reference] of Object.entries(dataModelBindings as Record<string, IDataModelReference>)) {
    if (isScalar(invalidDataSelector(reference))) {
      validations.push({
        source: FrontendValidationSource.InvalidData,
        message: { key: 'validation_errors.pattern' },
        severity: 'error',
        bindingKey,
        category: ValidationMask.Schema, // Use same visibility as schema validations
      });
    }
  }
  return validations;
}
