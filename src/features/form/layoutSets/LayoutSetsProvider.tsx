import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { createStrictQueryContext } from 'src/features/contexts/queryContext';
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
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      dispatch(FormLayoutActions.fetchSetsFulfilled({ layoutSets }));
    },
    onError: (error: HttpClientError) => {
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      dispatch(FormLayoutActions.fetchSetsRejected({ error }));
      window.logError('Fetching layout sets failed:\n', error);
    },
  });
};

const { Provider, useCtx } = createStrictQueryContext<ILayoutSets>({
  name: 'LayoutSets',
  useQuery: useLayoutSetsQuery,
});

export const LayoutSetsProvider = Provider;
export const useLayoutSets = useCtx;
