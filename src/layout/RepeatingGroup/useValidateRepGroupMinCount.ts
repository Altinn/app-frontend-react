import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { RepGroupHooks } from 'src/layout/RepeatingGroup/utils';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useDataModelBindingsFor, useExternalItem } from 'src/utils/layout/hooks';
import { useNode } from 'src/utils/layout/NodesContext';
import type { ComponentValidation } from 'src/features/validation';

export function useValidateRepGroupMinCount(baseComponentId: string): ComponentValidation[] {
  const dataModelBindings = useDataModelBindingsFor(baseComponentId, 'RepeatingGroup');
  const minCount = useExternalItem(baseComponentId, 'RepeatingGroup')?.minCount ?? 0;
  const node = useNode(useIndexedId(baseComponentId));
  if (!node.isType('RepeatingGroup')) {
    throw new Error('useValidateRepGroupMinCount can only be used on a RepeatingGroup');
  }

  const visibleRows = RepGroupHooks.useVisibleRows(node).length;
  if (!dataModelBindings) {
    return [];
  }

  const validations: ComponentValidation[] = [];

  // check if minCount is less than visible rows
  if (visibleRows !== undefined && visibleRows < minCount) {
    validations.push({
      message: { key: 'validation_errors.minItems', params: [minCount] },
      severity: 'error',
      source: FrontendValidationSource.Component,
      // Treat visibility of minCount the same as required to prevent showing an error immediately
      category: ValidationMask.Required,
    });
  }

  return validations;
}
