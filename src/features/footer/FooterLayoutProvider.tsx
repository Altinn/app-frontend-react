import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createStrictQueryContext } from 'src/core/contexts/queryContext';
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
      dispatch(FooterLayoutActions.fetchFulfilled({ footerLayout }));
    },
    onError: (error: HttpClientError) => {
      window.logError('Fetching footer failed:\n', error);
    },
  });
};

const { Provider, useCtx } = delayedContext(() =>
  createStrictQueryContext({
    name: 'FooterLayout',
    useQuery: useFooterLayoutQuery,
  }),
);

export const FooterLayoutProvider = Provider;
export const useFooterLayout = () => useCtx();
