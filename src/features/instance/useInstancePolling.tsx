import { useCallback, useEffect, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { instanceQueryKeys } from 'src/features/instance/InstanceContext';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';

interface UseInstancePollingOptions {
  intervalMs?: number;
  maxAttempts?: number;
}

export function useInstancePolling(options: UseInstancePollingOptions = {}) {
  const { intervalMs = 5000, maxAttempts = 60 } = options;
  const partyId = useNavigationParam('instanceOwnerPartyId');
  const instanceGuid = useNavigationParam('instanceGuid');
  const queryClient = useQueryClient();
  const pollingAttempts = useRef(0);
  const intervalRef = useRef<number>();
  const isPolling = useRef(false);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    pollingAttempts.current = 0;
    isPolling.current = false;
  }, []);

  const startPolling = useCallback(() => {
    if (isPolling.current || !partyId || !instanceGuid) {
      return;
    }
    isPolling.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(async () => {
      pollingAttempts.current += 1;
      if (pollingAttempts.current >= maxAttempts) {
        stopPolling();
        return;
      }
      // Use the proper instance query key from InstanceContext
      await queryClient.refetchQueries({
        queryKey: instanceQueryKeys.instanceData(partyId, instanceGuid),
      });
    }, intervalMs);
  }, [partyId, instanceGuid, intervalMs, maxAttempts, queryClient, stopPolling]);

  // Clean up on unmount
  useEffect(() => stopPolling, [stopPolling]);

  return { startPolling, stopPolling };
}
