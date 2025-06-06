import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useStrictDataElements } from 'src/features/instance/InstanceContext';
import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { Validation } from 'src/features/validation/validationContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { ComponentValidation, SubformValidation } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useValidateSubform(node: LayoutNode<'Subform'>): ComponentValidation[] {
  const applicationMetadata = useApplicationMetadata();
  const layoutSets = useLayoutSets();
  const layoutSetName = NodesInternal.useNodeData(node, (data) => data.layout.layoutSet);
  if (!layoutSetName) {
    throw new Error(`Layoutset not found for node with id ${node.id}.`);
  }
  const targetType = layoutSets.find((set) => set.id === layoutSetName)?.dataType;
  if (!targetType) {
    throw new Error(`Data type not found for layout with name ${layoutSetName}`);
  }
  const elements = useStrictDataElements(targetType);
  const subformIdsWithError = Validation.useDataElementsWithErrors(elements.map((dE) => dE.id));
  const dataTypeDefinition = applicationMetadata.dataTypes.find((x) => x.id === targetType);
  if (dataTypeDefinition === undefined) {
    return [];
  }

  const validations: ComponentValidation[] = [];

  const { minCount, maxCount } = dataTypeDefinition;

  if (minCount > 0 && elements.length < minCount) {
    validations.push({
      message: { key: 'form_filler.error_min_count_not_reached_subform', params: [minCount, targetType] },
      severity: 'error',
      source: FrontendValidationSource.Component,
      category: ValidationMask.Required,
    });
  }

  if (maxCount > 0 && elements.length > maxCount) {
    validations.push({
      message: { key: 'form_filler.error_max_count_reached_subform_local', params: [targetType, maxCount] },
      severity: 'error',
      source: FrontendValidationSource.Component,
      category: ValidationMask.Required,
    });
  }

  if (subformIdsWithError.length) {
    const validation: SubformValidation = {
      subformDataElementIds: subformIdsWithError,
      message: { key: 'form_filler.error_validation_inside_subform', params: [targetType] },
      severity: 'error',
      source: FrontendValidationSource.Component,
      category: ValidationMask.Required,
      noIncrementalUpdates: true, // Validations for subform data is not updated incrementally in the main form
    };

    validations.push(validation);
  }

  return validations;
}
