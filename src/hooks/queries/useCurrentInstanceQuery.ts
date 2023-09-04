import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import type { IInstance } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

enum ServerStateCacheKey {
  GetCurrentInstance = 'getCurrentInstance',
}

export const useCurrentInstanceQuery = (instanceId: string, enabled?: boolean): UseQueryResult<IInstance> => {
  const { fetchCurrentInstance } = useAppQueriesContext();

  return useQuery([ServerStateCacheKey.GetCurrentInstance, instanceId], () => fetchCurrentInstance(instanceId), {
    enabled,
    onError: (error: HttpClientError) => {
      console.warn(error);
      throw new Error('Failed to fetch current instance');
    },
  });
};
