import { FileScanResults } from 'src/features/attachments/types';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';

/**
 * Check instance data directly for pending file scans
 * This avoids dependency on nodes context and works during initial loading
 */
export function useHasPendingScans(): boolean {
  const instanceData = useLaxInstanceData((data) => data);

  if (!instanceData?.data) {
    return false;
  }

  return instanceData.data.some((dataElement) => dataElement.fileScanResult === FileScanResults.Pending);
}
