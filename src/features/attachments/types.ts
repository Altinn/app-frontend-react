/**
 * File scan result enum matching the C# backend enum
 */
export type FileScanResult = 'NotApplicable' | 'Pending' | 'Clean' | 'Infected';

/**
 * Attachment processing states for UI feedback
 */
export type AttachmentProcessingState = 'uploading' | 'deleting' | 'updating';

/**
 * Combined attachment states for priority-based messaging
 * Priority order: Infected > uploading/deleting/updating > Pending > ready
 */
export type AttachmentState = FileScanResult | AttachmentProcessingState | 'ready';

/**
 * Return type for enhanced attachment state hook
 */
export interface AttachmentStateInfo {
  hasPending: boolean;
  state: AttachmentState;
}
