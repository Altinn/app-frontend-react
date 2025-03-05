import { isAttachmentUploaded } from 'src/features/attachments';
import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { GeneratorData } from 'src/utils/layout/generator/GeneratorDataSources';
import type { AttachmentValidation, ComponentValidation } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useValidateMissingTag(node: LayoutNode<'FileUploadWithTag'>): ComponentValidation[] {
  const { attachmentsSelector, nodeDataSelector } = GeneratorData.useValidationDataSources();
  const attachments = attachmentsSelector(node.id);
  const validations: ComponentValidation[] = [];

  for (const attachment of attachments) {
    if (isAttachmentUploaded(attachment) && (attachment.data.tags === undefined || attachment.data.tags.length === 0)) {
      const tagKey = nodeDataSelector(
        (picker) => picker(node.id, 'FileUploadWithTag')?.item?.textResourceBindings?.tagTitle,
        [node.id],
      );
      const tagReference = tagKey
        ? {
            key: tagKey,
            makeLowerCase: true,
          }
        : 'tag';

      const validation: AttachmentValidation = {
        message: {
          key: 'form_filler.file_uploader_validation_error_no_chosen_tag',
          params: [tagReference],
        },
        severity: 'error',
        source: FrontendValidationSource.Component,
        attachmentId: attachment.data.id,
        // Treat visibility of missing tag the same as required to prevent showing an error immediately
        category: ValidationMask.Required,
      };
      validations.push(validation);
    }
  }

  return validations;
}
