import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { useAllowAnonymousIs } from 'src/features/applicationMetadata/getAllowAnonymous';
import { createLaxQueryContext } from 'src/features/contexts/queryContext';
import type { IParty } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const usePartiesQuery = () => {
  const enabled = useAllowAnonymousIs(false);

  const { fetchParties } = useAppQueries();
  const utils = useQuery({
    enabled,
    queryKey: ['fetchUseParties'],
    queryFn: () => fetchParties(),
    onError: (error: HttpClientError) => {
      window.logError('Fetching parties failed:\n', error);
    },
  });

  return {
    ...utils,
    enabled,
  };
};

const { Provider, useCtx } = createLaxQueryContext<IParty[]>({
  name: 'Parties',
  useQuery: usePartiesQuery,
});

export const PartiesProvider = Provider;
export const useParties = useCtx;
