import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { ContextNotProvided } from 'src/core/contexts/context';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { useCurrentLayoutSetId } from 'src/features/form/layoutSets/useCurrentLayoutSetId';

function useDynamicsQuery() {
  const { fetchDynamics } = useAppQueries();
  const layoutSetId = useCurrentLayoutSetId();

  if (!layoutSetId) {
    throw new Error('No layoutSet id found');
  }

  const utils = useQuery({
    queryKey: ['fetchDynamics', layoutSetId],
    queryFn: () => fetchDynamics(layoutSetId),
    select: (dynamics) => dynamics?.data || null,
  });

  useEffect(() => {
    utils.error && window.logError('Fetching dynamics failed:\n', utils.error);
  }, [utils.error]);

  return utils;
}

const { Provider, useCtx, useLaxCtx } = delayedContext(() =>
  createQueryContext({
    name: 'Dynamics',
    required: true,
    query: useDynamicsQuery,
  }),
);

export const DynamicsProvider = Provider;
export const useDynamics = () => useCtx();
export const useRuleConnections = () => {
  const dynamics = useLaxCtx();
  return dynamics === ContextNotProvided ? null : dynamics?.ruleConnection ?? null;
};
