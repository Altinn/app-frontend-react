import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { createStrictQueryContext } from 'src/features/contexts/queryContext';
import { FooterLayoutActions } from 'src/features/footer/data/footerLayoutSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IFooterLayout } from 'src/features/footer/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useFooterLayoutQuery = (): UseQueryResult<IFooterLayout> => {
  const dispatch = useAppDispatch();
  const { fetchFooterLayout } = useAppQueries();
  return useQuery({
    queryKey: ['fetchFooterLayout'],
    queryFn: fetchFooterLayout,
    onSuccess: (footerLayout) => {
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      dispatch(FooterLayoutActions.fetchFulfilled({ footerLayout }));
    },
    onError: (error: HttpClientError) => {
      window.logError('Fetching footer failed:\n', error);
    },
  });
};

const { Provider, useCtx } = createStrictQueryContext<IFooterLayout>({
  name: 'FooterLayout',
  useQuery: useFooterLayoutQuery,
});

export const FooterLayoutProvider = Provider;
export const useFooterLayout = useCtx;
