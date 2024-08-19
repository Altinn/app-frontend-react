import { usePrefetchQuery } from 'src/core/queries/usePrefetchQuery';
import { useCurrentPartyQueryDef, usePartiesQueryDef } from 'src/features/party/PartiesProvider';
import { useShouldFetchParties, useShouldFetchProfile } from 'src/features/profile/ProfileProvider';

/**
 * Prefetches parties and current party if applicable
 */
export function PartyPrefetcher() {
  const shouldFetchProfile = useShouldFetchProfile();
  const shouldFetchParties = useShouldFetchParties();
  const enabled = shouldFetchProfile && shouldFetchParties;

  usePrefetchQuery(usePartiesQueryDef(enabled), enabled);
  usePrefetchQuery(useCurrentPartyQueryDef(enabled), enabled);

  return null;
}
