import React from 'react';

import { getUploaderSummaryData } from 'src/layout/FileUpload/shared/summary';
import { AttachmentWithTagSummaryComponent } from 'src/layout/FileUploadWithTag/AttachmentWithTagSummaryComponent';
import { FileUploadWithTagDef } from 'src/layout/FileUploadWithTag/config.generated';
import { FileUploadWithTagComponent } from 'src/layout/FileUploadWithTag/FileUploadWithTagComponent';
import { AsciiUnitSeparator } from 'src/utils/attachment';
import { attachmentIsMissingTag, attachmentsValid } from 'src/utils/validation/validation';
import { buildValidationObject } from 'src/utils/validation/validationHelpers';
import type { IFormData } from 'src/features/formData';
import type { ComponentValidation, PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { IValidationContext, IValidationObject } from 'src/utils/validation/types';

export class FileUploadWithTag extends FileUploadWithTagDef implements ComponentValidation {
  render(props: PropsFromGenericComponent<'FileUploadWithTag'>): JSX.Element | null {
    return <FileUploadWithTagComponent {...props} />;
  }

  renderDefaultValidations(): boolean {
    return false;
  }

  getDisplayData(node: LayoutNodeFromType<'FileUploadWithTag'>, { formData, attachments }): string {
    return getUploaderSummaryData(node, formData, attachments)
      .map((a) => a.name)
      .join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'FileUploadWithTag'>): JSX.Element | null {
    return <AttachmentWithTagSummaryComponent targetNode={targetNode} />;
  }

  // This component does not have empty field validation, so has to override its inherited method
  runEmptyFieldValidation(): IValidationObject[] {
    return [];
  }

  runComponentValidation(
    node: LayoutNodeFromType<'FileUploadWithTag'>,
    { attachments, langTools }: IValidationContext,
    _overrideFormData?: IFormData,
  ): IValidationObject[] {
    const validations: IValidationObject[] = [];
    if (attachmentsValid(attachments, node.item)) {
      const missingTagAttachments = attachments[node.item.id]
        ?.filter((attachment) => attachmentIsMissingTag(attachment))
        .map((attachment) => attachment.id);

      if (missingTagAttachments?.length > 0) {
        missingTagAttachments.forEach((missingId) => {
          const message = `${
            missingId +
            AsciiUnitSeparator +
            langTools.langAsString('form_filler.file_uploader_validation_error_no_chosen_tag')
          } ${(node.item.textResourceBindings?.tagTitle || '').toLowerCase()}.`;
          validations.push(buildValidationObject(node, 'errors', message));
        });
      }
    } else {
      const message = `${langTools.langAsString('form_filler.file_uploader_validation_error_file_number_1')} ${
        node.item.minNumberOfAttachments
      } ${langTools.langAsString('form_filler.file_uploader_validation_error_file_number_2')}`;
      validations.push(buildValidationObject(node, 'errors', message));
    }
    return validations;
  }
}
