import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { useAllowAnonymousIs } from 'src/features/applicationMetadata/getAllowAnonymous';
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

const { Provider, useCtx } = delayedContext(() =>
  createQueryContext<IParty[] | undefined, false>({
    name: 'Parties',
    required: false,
    default: undefined,
    query: usePartiesQuery,
  }),
);

export const PartiesProvider = Provider;
export const useParties = () => useCtx();
