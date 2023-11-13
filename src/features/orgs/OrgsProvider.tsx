import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { createStrictQueryContext } from 'src/features/contexts/queryContext';
import { OrgsActions } from 'src/features/orgs/orgsSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IAltinnOrgs } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const extractOrgsFromServerResponse = (response: { orgs: IAltinnOrgs }): IAltinnOrgs => response.orgs;

const useOrgsQuery = (): UseQueryResult<IAltinnOrgs> => {
  const dispatch = useAppDispatch();
  const { fetchOrgs } = useAppQueries();
  return useQuery({
    queryKey: ['fetchOrganizations'],
    queryFn: () => fetchOrgs().then(extractOrgsFromServerResponse),
    onSuccess: (orgs) => {
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      dispatch(OrgsActions.fetchFulfilled({ orgs }));
    },
    onError: (error: HttpClientError) => {
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      OrgsActions.fetchRejected({ error });
      window.logError('Fetching organizations failed:\n', error);
    },
  });
};

const { Provider, useCtx } = createStrictQueryContext<IAltinnOrgs>({
  name: 'Orgs',
  useQuery: useOrgsQuery,
});

export const OrgsProvider = Provider;
export const useOrgs = useCtx;
