import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { useCurrentParty } from 'src/features/party/PartiesProvider';

export const useActiveInstancesQuery = () => {
  const { fetchActiveInstances } = useAppQueries();
  const currentParty = useCurrentParty();

  const utils = useQuery({
    queryKey: ['getActiveInstances', currentParty?.partyId],
    queryFn: async () => {
      const simpleInstances = await fetchActiveInstances(currentParty?.partyId ?? -1);

      // Sort array by last changed date
      simpleInstances.sort((a, b) => new Date(a.lastChanged).getTime() - new Date(b.lastChanged).getTime());

      return simpleInstances;
    },
  });

  useEffect(() => {
    utils.error && window.logError('Fetching active instances failed:\n', utils.error);
  }, [utils.error]);

  return utils;
};
