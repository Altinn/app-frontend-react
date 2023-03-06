import React from 'react';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { AttachmentSummaryComponent } from 'src/layout/FileUpload/AttachmentSummaryComponent';
import { FileUploadComponent } from 'src/layout/FileUpload/FileUploadComponent';
import {
  attachmentNamesFromComponentId,
  attachmentNamesFromUuids,
  extractListFromBinding,
} from 'src/layout/FileUpload/shared/summary';
import { FormComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class FileUpload extends FormComponent<'FileUpload'> {
  render(props: PropsFromGenericComponent<'FileUpload'>): JSX.Element | null {
    return <FileUploadComponent {...props} />;
  }

  renderDefaultValidations(): boolean {
    return false;
  }

  private useSummaryData(node: LayoutNodeFromType<'FileUpload'>): string[] {
    const formData = useAppSelector((state) => state.formData.formData);
    const attachments = useAppSelector((state) => state.attachments.attachments);

    const listBinding = node.item.dataModelBindings?.list;
    if (listBinding) {
      const values = extractListFromBinding(formData, listBinding);
      return attachmentNamesFromUuids(node.item.id, values, attachments);
    }

    return attachmentNamesFromComponentId(node.item.id, attachments);
  }

  useDisplayData(node: LayoutNodeFromType<'FileUpload'>): string {
    return this.useSummaryData(node).join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'FileUpload'>): JSX.Element | null {
    return <AttachmentSummaryComponent targetNode={targetNode} />;
  }
}
