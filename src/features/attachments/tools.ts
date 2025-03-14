import { sortAttachmentsByName } from 'src/features/attachments/sortAttachments';
import { isAtLeastVersion } from 'src/utils/versionCompare';
import type { ApplicationMetadata } from 'src/features/applicationMetadata/types';
import type { IAttachment } from 'src/features/attachments/index';
import type { NodesContext } from 'src/utils/layout/NodesContext';

const emptyArray = [];

export type AttachmentsSelector = (nodeId: string) => IAttachment[];
export const attachmentSelector = (nodeId: string) => (state: NodesContext) => {
  const nodeData = state.nodeData[nodeId];
  if (!nodeData) {
    return emptyArray;
  }
  if (nodeData && 'attachments' in nodeData) {
    return Object.values(nodeData.attachments).sort(sortAttachmentsByName);
  }
  return emptyArray;
};

export function appSupportsNewAttachmentAPI({ altinnNugetVersion }: ApplicationMetadata) {
  return !altinnNugetVersion || isAtLeastVersion({ actualVersion: altinnNugetVersion, minimumVersion: '8.5.0.153' });
}
