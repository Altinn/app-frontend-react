export type FileScanResult = 'NotApplicable' | 'Pending' | 'Clean' | 'Infected';

export type AttachmentProcessingState = 'uploading' | 'deleting' | 'updating';

export type AttachmentState = FileScanResult | AttachmentProcessingState | 'ready';

export interface AttachmentStateInfo {
  hasPending: boolean;
  state: AttachmentState;
}
