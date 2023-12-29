import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useLayoutSetsQuery = () => {
  const { fetchLayoutSets } = useAppQueries();
  return useQuery({
    queryKey: ['fetchLayoutSets'],
    queryFn: fetchLayoutSets,
    onError: (error: HttpClientError) => {
      window.logError('Fetching layout sets failed:\n', error);
    },
  });
};

const { Provider, useCtx } = delayedContext(() =>
  createQueryContext({
    name: 'LayoutSets',
    required: true,
    query: useLayoutSetsQuery,
  }),
);

export const LayoutSetsProvider = Provider;
export const useLayoutSets = () => useCtx();
