import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createStrictQueryContext } from 'src/core/contexts/queryContext';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { ILayoutSets } from 'src/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useLayoutSetsQuery = (): UseQueryResult<ILayoutSets> => {
  const dispatch = useAppDispatch();
  const { fetchLayoutSets } = useAppQueries();
  return useQuery({
    queryKey: ['fetchLayoutSets'],
    queryFn: fetchLayoutSets,
    onSuccess: (layoutSets) => {
      dispatch(FormLayoutActions.fetchSetsFulfilled({ layoutSets }));
    },
    onError: (error: HttpClientError) => {
      window.logError('Fetching layout sets failed:\n', error);
    },
  });
};

const { Provider, useCtx } = delayedContext(() =>
  createStrictQueryContext({
    name: 'LayoutSets',
    useQuery: useLayoutSetsQuery,
  }),
);

export const LayoutSetsProvider = Provider;
export const useLayoutSets = () => useCtx();
