import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { GeneratorData } from 'src/utils/layout/generator/GeneratorDataSources';
import type { ComponentValidation } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useValidateRepGroupMinCount(node: LayoutNode<'RepeatingGroup'>): ComponentValidation[] {
  const { nodeDataSelector } = GeneratorData.useValidationDataSources();
  const dataModelBindings = nodeDataSelector(
    (picker) => picker(node.id, 'RepeatingGroup')?.layout.dataModelBindings,
    [node.id],
  );
  if (!dataModelBindings) {
    return [];
  }

  const validations: ComponentValidation[] = [];
  // check if minCount is less than visible rows
  const minCount = nodeDataSelector((picker) => picker(node.id, 'RepeatingGroup')?.item?.minCount, [node.id]) ?? 0;
  const visibleRows = nodeDataSelector(
    (picker) =>
      picker(node.id, 'RepeatingGroup')?.item?.rows?.filter((row) => row && !row.groupExpressions?.hiddenRow).length,
    [node.id],
  );

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
