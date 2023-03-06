import React from 'react';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import {
  attachmentNamesFromComponentId,
  attachmentNamesFromUuids,
  extractListFromBinding,
} from 'src/layout/FileUpload/shared/summary';
import { FileUploadWithTagComponent } from 'src/layout/FileUploadWithTag/FileUploadWithTagComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class FileUploadWithTag extends FormComponent<'FileUploadWithTag'> {
  render(props: PropsFromGenericComponent<'FileUploadWithTag'>): JSX.Element | null {
    return <FileUploadWithTagComponent {...props} />;
  }

  renderDefaultValidations(): boolean {
    return false;
  }

  private useSummaryData(node: LayoutNodeFromType<'FileUploadWithTag'>): string[] {
    const formData = useAppSelector((state) => state.formData.formData);
    const attachments = useAppSelector((state) => state.attachments.attachments);

    const listBinding = node.item.dataModelBindings?.list;
    if (listBinding) {
      const values = extractListFromBinding(formData, listBinding);
      return attachmentNamesFromUuids(node.item.id, values, attachments);
    }

    return attachmentNamesFromComponentId(node.item.id, attachments);
  }

  useDisplayData(node: LayoutNodeFromType<'FileUploadWithTag'>): string {
    return this.useSummaryData(node).join(', ');
  }

  renderSummary(_props: SummaryRendererProps<'FileUploadWithTag'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Nothing implemented yet</span>;
  }
}
