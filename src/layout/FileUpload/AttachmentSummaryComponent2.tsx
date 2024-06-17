import React from 'react';

import {
  AttachmentsMappedToFormDataProvider,
  useAttachmentsMappedToFormData,
} from 'src/features/attachments/useAttachmentsMappedToFormData';
import { useAllOptions } from 'src/features/options/useAllOptions';
import { FileTable } from 'src/layout/FileUpload/FileUploadTable/FileTable';
import { useUploaderSummaryData } from 'src/layout/FileUpload/Summary/summary';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IAttachmentSummaryComponent {
  targetNode: LayoutNode<'FileUpload' | 'FileUploadWithTag'>;
}

export function AttachmentSummaryComponent2({ targetNode }: IAttachmentSummaryComponent) {
  const attachments = useUploaderSummaryData(targetNode);
  const component = targetNode.item;
  const allOptions = useAllOptions();
  const hasTag = component.type === 'FileUploadWithTag';
  const options = hasTag ? allOptions[component.id] : undefined;
  const mappingTools = useAttachmentsMappedToFormData(targetNode);

  return (
    <AttachmentsMappedToFormDataProvider mappingTools={mappingTools}>
      <FileTable
        node={targetNode}
        mobileView={false}
        attachments={attachments}
        options={options}
        isSummary={true}
      />
    </AttachmentsMappedToFormDataProvider>
  );
}
