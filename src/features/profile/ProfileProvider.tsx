import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createLaxQueryContext } from 'src/core/contexts/queryContext';
import { useAllowAnonymousIs } from 'src/features/applicationMetadata/getAllowAnonymous';
import { ProfileActions } from 'src/features/profile/profileSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IProfile } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useProfileQuery = () => {
  const dispatch = useAppDispatch();
  const enabled = useAllowAnonymousIs(false);

  const { fetchUserProfile } = useAppQueries();
  const utils = useQuery(['fetchUserProfile'], fetchUserProfile, {
    enabled,
    onSuccess: (profile) => {
      dispatch(ProfileActions.fetchFulfilled({ profile }));
    },
    onError: (error: HttpClientError) => {
      window.logError('Fetching user profile failed:\n', error);
    },
  });

  return {
    ...utils,
    enabled,
  };
};

const { Provider, useCtx } = delayedContext(() =>
  createLaxQueryContext<IProfile>({
    name: 'Profile',
    useQuery: useProfileQuery,
  }),
);

export const ProfileProvider = Provider;
export const useProfile = () => useCtx();
