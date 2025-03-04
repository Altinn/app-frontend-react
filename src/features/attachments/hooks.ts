import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { FileUploaderNode } from 'src/features/attachments/index';

export const useAttachmentsUploader = () => NodesInternal.useAttachmentsUpload();
export const useAttachmentsUpdater = () => NodesInternal.useAttachmentsUpdate();
export const useAttachmentsRemover = () => NodesInternal.useAttachmentsRemove();
export const useAttachmentsAwaiter = () => NodesInternal.useWaitUntilUploaded();
export const useAddRejectedAttachments = () => NodesInternal.useAddRejectedAttachments();
export const useDeleteFailedAttachment = () => NodesInternal.useDeleteFailedAttachment();

export const useAttachmentsFor = (node: FileUploaderNode) => NodesInternal.useAttachments(node.id);
export const useFailedAttachmentsFor = (node: FileUploaderNode) => NodesInternal.useFailedAttachments(node.id);

export const useAttachmentsSelector = () => NodesInternal.useAttachmentsSelector();

export const useHasPendingAttachments = () => NodesInternal.useHasPendingAttachments();
export const useAllAttachments = () => NodesInternal.useAllAttachments();
