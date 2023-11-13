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
      dispatch(ApplicationMetadataActions.getFulfilled({ applicationMetadata }));
    },
    onError: (error: HttpClientError) => {
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
