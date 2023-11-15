import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { useAllowAnonymousIs } from 'src/features/applicationMetadata/getAllowAnonymous';
import { createLaxQueryContext } from 'src/features/contexts/queryContext';
import { PartyActions } from 'src/features/party/partySlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const usePartiesQuery = () => {
  const dispatch = useAppDispatch();
  const enabled = useAllowAnonymousIs(false);

  const { fetchParties } = useAppQueries();
  const utils = useQuery({
    enabled,
    queryKey: ['fetchUseParties'],
    queryFn: () => fetchParties(),
    onSuccess: (parties) => {
      dispatch(PartyActions.getPartiesFulfilled({ parties }));
    },
    onError: (error: HttpClientError) => {
      window.logError('Fetching parties failed:\n', error);
    },
  });

  return {
    ...utils,
    enabled,
  };
};

const { Provider, useCtx } = createLaxQueryContext({
  name: 'Parties',
  useQuery: usePartiesQuery,
});

export const PartiesProvider = Provider;
export const useParties = useCtx;
