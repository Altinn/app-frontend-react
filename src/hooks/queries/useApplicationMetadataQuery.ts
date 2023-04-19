import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { ApplicationMetadataActions } from 'src/features/applicationMetadata/applicationMetadataSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';

enum ServerStateCacheKey {
  ApplicationMetadata = 'fetchApplicationMetadata',
}

export const useApplicationMetadataQuery = (): UseQueryResult<IApplicationMetadata> => {
  const dispatch = useAppDispatch();
  const { fetchApplicationMetadata } = useAppQueriesContext();
  return useQuery([ServerStateCacheKey.ApplicationMetadata], fetchApplicationMetadata, {
    onSuccess: (applicationMetadata) => {
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      dispatch(ApplicationMetadataActions.getFulfilled({ applicationMetadata }));
    },
    onError: (error: Error) => {
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      dispatch(ApplicationMetadataActions.getRejected({ error }));
    },
  });
};
