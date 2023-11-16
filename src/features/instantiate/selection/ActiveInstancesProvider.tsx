import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createStrictQueryContext } from 'src/core/contexts/queryContext';
import type { ISimpleInstance } from 'src/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useActiveInstancesQuery = (partyId?: string, enabled?: boolean) => {
  const { fetchActiveInstances } = useAppQueries();
  return useQuery({
    enabled,
    queryKey: ['getActiveInstances'],
    queryFn: async () => {
      const simpleInstances = await fetchActiveInstances(partyId || '');

      // Sort array by last changed date
      simpleInstances.sort((a, b) => new Date(a.lastChanged).getTime() - new Date(b.lastChanged).getTime());

      return simpleInstances;
    },
    onError: (error: HttpClientError) => {
      window.logErrorOnce('Failed to find any active instances:\n', error);
    },
  });
};

const { Provider, useCtx } = delayedContext(() =>
  createStrictQueryContext<ISimpleInstance[]>({
    name: 'ActiveInstances',
    useQuery: useActiveInstancesQuery,
  }),
);

export const ActiveInstancesProvider = Provider;
export const useActiveInstances = () => useCtx();
