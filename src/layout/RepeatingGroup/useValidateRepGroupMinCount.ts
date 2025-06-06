import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { useRepeatingGroupVisibleRows } from 'src/layout/RepeatingGroup/rowUtils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { ComponentValidation } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useValidateRepGroupMinCount(node: LayoutNode<'RepeatingGroup'>): ComponentValidation[] {
  const dataModelBindings = NodesInternal.useNodeData(node, (d) => d.layout.dataModelBindings);
  const minCount = NodesInternal.useNodeData(node, (d) => d.layout.minCount) ?? 0;
  const visibleRows = useRepeatingGroupVisibleRows(node).length;
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
