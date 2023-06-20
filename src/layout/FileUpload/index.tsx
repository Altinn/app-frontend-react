import React from 'react';

import { staticUseLanguageFromState } from 'src/hooks/useLanguage';
import { AttachmentSummaryComponent } from 'src/layout/FileUpload/AttachmentSummaryComponent';
import { FileUploadComponent } from 'src/layout/FileUpload/FileUploadComponent';
import { useUploaderSummaryData } from 'src/layout/FileUpload/shared/summary';
import { FormComponent } from 'src/layout/LayoutComponent';
import { attachmentsValid } from 'src/utils/validation/validation';
import { buildValidationObject } from 'src/utils/validation/validationHelpers';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompFileUpload } from 'src/layout/FileUpload/types';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { IRuntimeState } from 'src/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationObject } from 'src/utils/validation/types';

export class FileUpload extends FormComponent<'FileUpload'> {
  render(props: PropsFromGenericComponent<'FileUpload'>): JSX.Element | null {
    return <FileUploadComponent {...props} />;
  }

  renderDefaultValidations(): boolean {
    return false;
  }

  useDisplayData(node: LayoutNodeFromType<'FileUpload'>): string {
    return useUploaderSummaryData(node)
      .map((a) => a.name)
      .join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'FileUpload'>): JSX.Element | null {
    return <AttachmentSummaryComponent targetNode={targetNode} />;
  }

  canRenderInTable(): boolean {
    return false;
  }

  runEmptyFieldValidation(_node: LayoutNodeFromType<'FileUpload'>): IValidationObject[] {
    return [];
  }

  runComponentValidations(node: LayoutNodeFromType<'FileUpload'>): IValidationObject[] {
    if (node.isHidden()) {
      return [];
    }

    const state: IRuntimeState = window.reduxStore.getState();
    const attachments = state.attachments.attachments;
    const { langAsString } = staticUseLanguageFromState(state);

    if (!attachmentsValid(attachments, node.item)) {
      const message = `${langAsString('form_filler.file_uploader_validation_error_file_number_1')} ${
        node.item.minNumberOfAttachments
      } ${langAsString('form_filler.file_uploader_validation_error_file_number_2')}`;
      return [buildValidationObject(node, 'errors', message)];
    }
    return [];
  }
}

export const Config = {
  def: new FileUpload(),
};

export type TypeConfig = {
  layout: ILayoutCompFileUpload;
  nodeItem: ExprResolved<ILayoutCompFileUpload>;
  nodeObj: LayoutNode;
};
