import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { ProfileActions } from 'src/features/profile/profileSlice';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IProfile } from 'src/types/shared';

enum ServerStateCacheKey {
  GetUserProfile = 'fetchUserProfile',
}
export const useProfileQuery = (): UseQueryResult<IProfile> => {
  const dispatch = useAppDispatch();

  const { fetchUserProfile } = useAppQueriesContext();
  return useQuery([ServerStateCacheKey.GetUserProfile], fetchUserProfile, {
    onSuccess: (profile) => {
      dispatch(ProfileActions.fetchFulfilled({ profile }));
    },
    onError: (error: Error) => {
      dispatch(ProfileActions.fetchRejected({ error }));
      dispatch(QueueActions.userTaskQueueError({ error }));
    },
  });
};
