import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { ApplicationMetadataActions } from 'src/features/applicationMetadata/applicationMetadataSlice';
import { createStrictQueryContext } from 'src/features/contexts/queryContext';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IApplicationMetadata } from 'src/features/applicationMetadata/index';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useApplicationMetadataQuery = () => {
  const dispatch = useAppDispatch();
  const { fetchApplicationMetadata } = useAppQueries();
  return useQuery({
    queryKey: ['fetchApplicationMetadata'],
    queryFn: fetchApplicationMetadata,
    onSuccess: (applicationMetadata) => {
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      dispatch(ApplicationMetadataActions.getFulfilled({ applicationMetadata }));
    },
    onError: (error: HttpClientError) => {
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      dispatch(ApplicationMetadataActions.getRejected({ error }));
      window.logError('Fetching application metadata failed:\n', error);
    },
  });
};

const { Provider, useCtx } = createStrictQueryContext<IApplicationMetadata>({
  name: 'ApplicationMetadata',
  useQuery: useApplicationMetadataQuery,
});

export const ApplicationMetadataProvider = Provider;
export const useApplicationMetadata = useCtx;
