import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import type { ISimpleInstance } from 'src/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export const useActiveInstancesQuery = (partyId?: string, enabled?: boolean): UseQueryResult<ISimpleInstance[]> => {
  const { fetchActiveInstances } = useAppQueriesContext();
  return useQuery(['getActiveInstances'], () => fetchActiveInstances(partyId || ''), {
    enabled,
    onSuccess: (active) => {
      // Sort array by last changed date
      active.sort((a, b) => new Date(a.lastChanged).getTime() - new Date(b.lastChanged).getTime());
    },
    onError: (error: HttpClientError) => {
      console.warn(error);
      throw new Error('Server did not return active instances');
    },
  });
};
