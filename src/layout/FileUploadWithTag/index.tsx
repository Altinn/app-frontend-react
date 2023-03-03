import React from 'react';

import {
  attachmentNamesFromComponentId,
  attachmentNamesFromUuids,
  extractListFromBinding,
} from 'src/layout/FileUpload/shared/summary';
import { FileUploadWithTagComponent } from 'src/layout/FileUploadWithTag/FileUploadWithTagComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class FileUploadWithTag extends FormComponent<'FileUploadWithTag'> {
  render(props: PropsFromGenericComponent<'FileUploadWithTag'>): JSX.Element | null {
    return <FileUploadWithTagComponent {...props} />;
  }

  renderDefaultValidations(): boolean {
    return false;
  }

  getDisplayData({ targetNode, lookups }: SummaryRendererProps<'FileUploadWithTag'>): string[] {
    const listBinding = targetNode.item.dataModelBindings?.list;
    if (listBinding) {
      const values = extractListFromBinding(lookups.formData, listBinding);
      return attachmentNamesFromUuids(targetNode.item.id, values, lookups.attachments);
    }

    return attachmentNamesFromComponentId(targetNode.item.id, lookups.attachments);
  }

  renderSummary(_props: SummaryRendererProps<'FileUploadWithTag'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Nothing implemented yet</span>;
  }
}
