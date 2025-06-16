import { useEffect } from 'react';

import { type FileUploaderNode, isAttachmentUploaded } from 'src/features/attachments';
import { useAttachmentsFor } from 'src/features/attachments/hooks';
import { useInstancePolling } from 'src/features/instance/useInstancePolling';

export function useFileScanPolling(node: FileUploaderNode) {
  const attachments = useAttachmentsFor(node);
  const { startPolling, stopPolling } = useInstancePolling({
    intervalMs: 5000,
    maxAttempts: 120,
  });

  const hasPendingScans = attachments.some(
    (attachment) => isAttachmentUploaded(attachment) && attachment.data.fileScanResult === 'Pending',
  );

  useEffect(() => {
    if (hasPendingScans) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [hasPendingScans, startPolling, stopPolling]);

  return {
    isPolling: hasPendingScans,
    hasPendingScans,
  };
}
