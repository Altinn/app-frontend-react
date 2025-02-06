import { matchPath } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { usePrefetchQuery } from 'src/core/queries/usePrefetchQuery';
import { getApplicationMetadataQueryDef } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useApplicationSettingsQueryDef } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { useLayoutSetsQueryDef } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useInstanceDataQueryDef } from 'src/features/instance/InstanceContext';
import { getProcessQueryDef } from 'src/features/instance/ProcessContext';
import { useOrgsQueryDef } from 'src/features/orgs/OrgsProvider';
import { useCurrentPartyQueryDef, usePartiesQueryDef } from 'src/features/party/PartiesProvider';
import { useProfileQueryDef } from 'src/features/profile/ProfileProvider';
import { fetchInitialStateUrl } from 'src/next/App';
import type { InitialState } from 'src/next/types/InitialState';

export const useInitialStateQuery = (): UseQueryResult<InitialState, Error> =>
  useQuery<InitialState, Error>({
    queryKey: ['initialState'],
    queryFn: fetchInitialStateUrl,
  });

/**
 * Prefetches requests that require no processed data to determine the url
 * Only prefetches profile, parties, and current party if a partyId is present in the URL, this is to avoid 401 errors for anonymous apps
 * Only prefetches instance and process if a party- and instanceid is present in the URL
 */
export function AppPrefetcher() {
  const { partyId, instanceGuid } =
    matchPath({ path: '/instance/:partyId/:instanceGuid/*' }, window.location.hash.slice(1))?.params ?? {};
  const instanceId = partyId && instanceGuid ? `${partyId}/${instanceGuid}` : undefined;

  usePrefetchQuery(getApplicationMetadataQueryDef(instanceGuid));
  usePrefetchQuery(useLayoutSetsQueryDef());
  usePrefetchQuery(useProfileQueryDef(true), Boolean(partyId));
  usePrefetchQuery(useOrgsQueryDef());
  usePrefetchQuery(useApplicationSettingsQueryDef());
  usePrefetchQuery(usePartiesQueryDef(true), Boolean(partyId));
  usePrefetchQuery(useCurrentPartyQueryDef(true), Boolean(partyId));

  usePrefetchQuery(useInstanceDataQueryDef(false, partyId, instanceGuid));
  usePrefetchQuery(getProcessQueryDef(instanceId));

  usePrefetchQuery({
    queryKey: ['initialState'],
    queryFn: fetchInitialStateUrl,
  });

  return null;
}
