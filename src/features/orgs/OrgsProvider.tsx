import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import type { IAltinnOrgs } from 'src/types/shared';

const extractOrgsFromServerResponse = (response: { orgs: IAltinnOrgs }): IAltinnOrgs => response.orgs;

const useOrgsQuery = () => {
  const { fetchOrgs } = useAppQueries();
  const utils = useQuery({
    queryKey: ['fetchOrganizations'],
    queryFn: fetchOrgs,
    select: extractOrgsFromServerResponse,
  });

  useEffect(() => {
    utils.error && window.logError('Fetching organizations failed:\n', utils.error);
  }, [utils.error]);

  return utils;
};

const { Provider, useCtx, useHasProvider } = delayedContext(() =>
  createQueryContext({
    name: 'Orgs',
    required: true,
    query: useOrgsQuery,
  }),
);

export const OrgsProvider = Provider;
export const useOrgs = () => useCtx();
export const useHasOrgs = () => useHasProvider();
