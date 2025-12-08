import { type ComponentValidation, FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';

export function useValidateRequiredImageUpload(baseComponentId: string) {
  const validations: ComponentValidation[] = [];
  const item = useItemWhenType(baseComponentId, 'ImageUpload');
  const required = item && 'required' in item ? item.required : false;
  const attachments = NodesInternal.useAttachments(useIndexedId(baseComponentId));
  if (required && attachments.length === 0) {
    // Add validation logic for required ImageUpload
    validations.push({
      message: {
        key: 'image_upload_component.error_required',
      },
      severity: 'error',
      source: FrontendValidationSource.Component,
      category: ValidationMask.Required,
    });
  }
  return validations;
}
