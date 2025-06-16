import { useEffect } from 'react';

import { type FileUploaderNode, isAttachmentUploaded } from 'src/features/attachments';
import { useAttachmentsFor } from 'src/features/attachments/hooks';
import { useInstancePolling } from 'src/features/instance/useInstancePolling';

/**
 * Hook that automatically polls for file scan status updates when there are files
 * with pending scan status. Polling stops when all files have completed scanning.
 */
export function useFileScanPolling(node: FileUploaderNode) {
  const attachments = useAttachmentsFor(node);
  const { startPolling, stopPolling } = useInstancePolling({
    intervalMs: 5000, // Poll every 5 seconds
    maxAttempts: 120, // Maximum 10 minutes of polling (120 * 5s)
  });

  // Check if there are any files with pending scan status
  const hasPendingScans = attachments.some(
    (attachment) => isAttachmentUploaded(attachment) && attachment.data.fileScanResult === 'Pending',
  );

  useEffect(() => {
    if (hasPendingScans) {
      startPolling();
    } else {
      stopPolling();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [hasPendingScans, startPolling, stopPolling]);

  return {
    isPolling: hasPendingScans,
    hasPendingScans,
  };
}
