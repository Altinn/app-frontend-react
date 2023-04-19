import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { FooterLayoutActions } from 'src/features/footer/data/footerLayoutSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IFooterLayout } from 'src/features/footer/types';

enum ServerStateCacheKey {
  FetchFooterLayout = 'fetchFooterLayout',
}

export const useFooterLayoutQuery = (enabled?: boolean): UseQueryResult<IFooterLayout> => {
  const dispatch = useAppDispatch();
  const { fetchFooterLayout } = useAppQueriesContext();
  return useQuery([ServerStateCacheKey.FetchFooterLayout], fetchFooterLayout, {
    enabled,
    onSuccess: (footerLayout) => {
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      dispatch(FooterLayoutActions.fetchFulfilled({ footerLayout }));
    },
    onError: (error: Error) => {
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      dispatch(FooterLayoutActions.fetchRejected({ error }));
    },
  });
};
