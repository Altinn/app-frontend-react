import React from 'react';

import { staticUseLanguageFromState } from 'src/hooks/useLanguage';
import { useUploaderSummaryData } from 'src/layout/FileUpload/shared/summary';
import { AttachmentWithTagSummaryComponent } from 'src/layout/FileUploadWithTag/AttachmentWithTagSummaryComponent';
import { FileUploadWithTagComponent } from 'src/layout/FileUploadWithTag/FileUploadWithTagComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { AsciiUnitSeparator } from 'src/utils/attachment';
import { attachmentIsMissingTag, attachmentsValid } from 'src/utils/validation/validation';
import { buildValidationObject } from 'src/utils/validation/validationHelpers';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompFileUploadWithTag } from 'src/layout/FileUploadWithTag/types';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { IRuntimeState } from 'src/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationObject } from 'src/utils/validation/types';

export class FileUploadWithTag extends FormComponent<'FileUploadWithTag'> {
  render(props: PropsFromGenericComponent<'FileUploadWithTag'>): JSX.Element | null {
    return <FileUploadWithTagComponent {...props} />;
  }

  renderDefaultValidations(): boolean {
    return false;
  }

  useDisplayData(node: LayoutNodeFromType<'FileUploadWithTag'>): string {
    return useUploaderSummaryData(node)
      .map((a) => a.name)
      .join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'FileUploadWithTag'>): JSX.Element | null {
    return <AttachmentWithTagSummaryComponent targetNode={targetNode} />;
  }

  canRenderInTable(): boolean {
    return false;
  }

  runEmptyFieldValidation(_node: LayoutNodeFromType<'FileUploadWithTag'>): IValidationObject[] {
    return [];
  }

  runComponentValidations(node: LayoutNodeFromType<'FileUploadWithTag'>): IValidationObject[] {
    if (node.isHidden() || node.item.renderAsSummary) {
      return [];
    }

    const state: IRuntimeState = window.reduxStore.getState();
    const attachments = state.attachments.attachments;
    const { langAsString } = staticUseLanguageFromState(state);

    const validations: IValidationObject[] = [];
    if (attachmentsValid(attachments, node.item)) {
      const missingTagAttachments = attachments[node.item.id]
        ?.filter((attachment) => attachmentIsMissingTag(attachment))
        .map((attachment) => attachment.id);

      if (missingTagAttachments?.length > 0) {
        missingTagAttachments.forEach((missingId) => {
          const message = `${
            missingId + AsciiUnitSeparator + langAsString('form_filler.file_uploader_validation_error_no_chosen_tag')
          } ${(node.item.textResourceBindings?.tagTitle || '').toLowerCase()}.`;
          validations.push(buildValidationObject(node, 'errors', message));
        });
      }
    } else {
      const message = `${langAsString('form_filler.file_uploader_validation_error_file_number_1')} ${
        node.item.minNumberOfAttachments
      } ${langAsString('form_filler.file_uploader_validation_error_file_number_2')}`;
      validations.push(buildValidationObject(node, 'errors', message));
    }
    return validations;
  }
}

export const Config = {
  def: new FileUploadWithTag(),
};

export type TypeConfig = {
  layout: ILayoutCompFileUploadWithTag;
  nodeItem: ExprResolved<ILayoutCompFileUploadWithTag>;
  nodeObj: LayoutNode;
};
