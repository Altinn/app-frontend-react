import React from 'react';

import { FileUploadComponent } from 'src/layout/FileUpload/FileUploadComponent';
import {
  attachmentNamesFromComponentId,
  attachmentNamesFromUuids,
  extractListFromBinding,
} from 'src/layout/FileUpload/shared/summary';
import { FormComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class FileUpload extends FormComponent<'FileUpload'> {
  render(props: PropsFromGenericComponent<'FileUpload'>): JSX.Element | null {
    return <FileUploadComponent {...props} />;
  }

  renderDefaultValidations(): boolean {
    return false;
  }

  getDisplayData({ targetNode, lookups }: SummaryRendererProps<'FileUpload'>): string[] {
    const listBinding = targetNode.item.dataModelBindings?.list;
    if (listBinding) {
      const values = extractListFromBinding(lookups.formData, listBinding);
      return attachmentNamesFromUuids(targetNode.item.id, values, lookups.attachments);
    }

    return attachmentNamesFromComponentId(targetNode.item.id, lookups.attachments);
  }

  renderSummary(_props: SummaryRendererProps<'FileUpload'>): JSX.Element | null {
    return <span>Not implemented</span>;
  }
}
