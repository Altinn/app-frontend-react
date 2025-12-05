import { useCallback, useSyncExternalStore } from 'react';

import { hashKey, notifyManager, useQueryClient } from '@tanstack/react-query';

/* Efficient implementation of useIsFetching when the exact query key is known and you don't care about the count. */
export function useIsFetchingFast(queryKey: readonly unknown[]): boolean {
  const client = useQueryClient();
  const queryCache = client.getQueryCache();

  return useSyncExternalStore(
    useCallback((onStoreChange) => queryCache.subscribe(notifyManager.batchCalls(onStoreChange)), [queryCache]),
    () => queryCache.get(hashKey(queryKey))?.state.fetchStatus === 'fetching',
  );
}
