import { useEffect } from 'react';
import { matchPath } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';

export function GlobalPrefetcher() {
  const queryClient = useQueryClient();
  const {
    fetchApplicationMetadata,
    fetchApplicationSettings,
    fetchOrgs,
    fetchLayoutSets,
    fetchFooterLayout,
    fetchUserProfile,
    fetchParties,
    fetchCurrentParty,
    fetchInstanceData,
    fetchProcessState,
  } = useAppQueries();

  // Prefetch queries without dependencies
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['fetchApplicationMetadata'],
      queryFn: () => fetchApplicationMetadata(),
    });

    queryClient.prefetchQuery({
      queryKey: ['fetchApplicationSettings'],
      queryFn: fetchApplicationSettings,
    });

    queryClient.prefetchQuery({
      queryKey: ['fetchOrganizations'],
      queryFn: fetchOrgs,
    });

    queryClient.prefetchQuery({
      queryKey: ['fetchLayoutSets'],
      queryFn: fetchLayoutSets,
    });

    queryClient.prefetchQuery({
      queryKey: ['fetchFooterLayout'],
      queryFn: fetchFooterLayout,
    });

    queryClient.prefetchQuery({
      queryKey: ['fetchUserProfile'],
      queryFn: fetchUserProfile,
    });

    queryClient.prefetchQuery({
      queryKey: ['fetchUseParties'],
      queryFn: fetchParties,
    });

    queryClient.prefetchQuery({
      queryKey: ['fetchUseCurrentParty'],
      queryFn: fetchCurrentParty,
    });
  }, [
    fetchApplicationMetadata,
    fetchApplicationSettings,
    fetchCurrentParty,
    fetchFooterLayout,
    fetchLayoutSets,
    fetchOrgs,
    fetchParties,
    fetchUserProfile,
    queryClient,
  ]);

  // Prefetch instance data based on url
  const { partyId, instanceGuid } =
    matchPath({ path: '/instance/:partyId/:instanceGuid/*' }, window.location.hash.slice(1))?.params ?? {};
  useEffect(() => {
    if (partyId && instanceGuid) {
      queryClient.prefetchQuery({
        queryKey: ['fetchInstanceData', partyId, instanceGuid],
        queryFn: () => fetchInstanceData(partyId, instanceGuid),
      });

      const instanceId = `${partyId}/${instanceGuid}`;
      queryClient.prefetchQuery({
        queryKey: ['fetchProcessState', instanceId],
        queryFn: () => fetchProcessState(instanceId),
      });
    }
  }, [fetchInstanceData, fetchProcessState, instanceGuid, partyId, queryClient]);

  return null;
}
