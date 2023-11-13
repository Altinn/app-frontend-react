import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { useAllowAnonymousIs } from 'src/features/applicationMetadata/getAllowAnonymous';
import { createLaxQueryContext } from 'src/features/contexts/queryContext';
import { ProfileActions } from 'src/features/profile/profileSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IProfile } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useProfileQuery = (enabled: boolean): UseQueryResult<IProfile> => {
  const dispatch = useAppDispatch();

  const { fetchUserProfile } = useAppQueries();
  return useQuery(['fetchUserProfile'], fetchUserProfile, {
    enabled,
    onSuccess: (profile) => {
      dispatch(ProfileActions.fetchFulfilled({ profile }));
    },
    onError: (error: HttpClientError) => {
      window.logError('Fetching user profile failed:\n', error);
    },
  });
};

const { Provider, useCtx } = createLaxQueryContext<IProfile>({
  name: 'Profile',
  useQuery: useProfileQuery,
  useIsEnabled: () => useAllowAnonymousIs(false),
});

export const ProfileProvider = Provider;
export const useProfile = useCtx;
