import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { GeneratorData } from 'src/utils/layout/generator/GeneratorDataSources';
import type { ComponentValidation } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useValidateMinNumberOfAttachments(
  node: LayoutNode<'FileUpload' | 'FileUploadWithTag'>,
): ComponentValidation[] {
  const { nodeDataSelector, attachmentsSelector } = GeneratorData.useValidationDataSources();
  const validations: ComponentValidation[] = [];
  const minNumberOfAttachments = nodeDataSelector(
    (picker) => picker(node.id, 'FileUploadWithTag')?.item?.minNumberOfAttachments,
    [node.id],
  );

  const attachments = attachmentsSelector(node.id);
  if (
    minNumberOfAttachments !== undefined &&
    minNumberOfAttachments > 0 &&
    attachments.length < minNumberOfAttachments
  ) {
    validations.push({
      message: {
        key: 'form_filler.file_uploader_validation_error_file_number',
        params: [minNumberOfAttachments],
      },
      severity: 'error',
      source: FrontendValidationSource.Component,
      // Treat visibility of minNumberOfAttachments the same as required to prevent showing an error immediately
      category: ValidationMask.Required,
    });
  }

  return validations;
}
