import { useEffect } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryFunction, QueryKey, QueryOptions, SkipToken, UseQueryResult } from '@tanstack/react-query';

import { useAsRef } from 'src/hooks/useAsRef';

export type QueryDefinition<T> = {
  queryKey: QueryKey;
  queryFn: QueryFunction<T> | SkipToken;
  enabled?: boolean;
};

// @see https://tanstack.com/query/v5/docs/framework/react/guides/prefetching
export function usePrefetchQuery<T>(def: QueryDefinition<T>, enabled = true) {
  const client = useQueryClient();
  if (enabled && def.enabled !== false) {
    client.ensureQueryData(def).catch(() => {});
  }
}

export function useQueryWithPrefetch<T>(
  def: QueryDefinition<T>,
  options?: Omit<QueryOptions, 'queryKey' | 'queryFn' | 'enabled'>,
) {
  const utils = useQuery({
    ...def,
    ...options,
  }) as UseQueryResult<T>;

  const client = useQueryClient();
  const key = def.queryKey.join();
  const queryKey = useAsRef(def.queryKey);
  useEffect(() => {
    const cache = client.getQueryCache().find({ queryKey: queryKey.current });
    if (cache && typeof options?.gcTime === 'number' && cache.gcTime !== options.gcTime) {
      cache.gcTime = options.gcTime;
    }
  }, [client, options?.gcTime, key, queryKey]);

  return utils;
}
