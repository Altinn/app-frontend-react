import { usePrefetchQuery } from 'src/core/queries/usePrefetchQuery';
import { usePartiesQueryDef } from 'src/features/party/PartiesProvider';
import { useShouldFetchProfile } from 'src/features/profile/ProfileProvider';

/**
 * Prefetches parties and current party if applicable
 */
export function PartyPrefetcher() {
  const enabled = useShouldFetchProfile();

  usePrefetchQuery(usePartiesQueryDef(true), enabled);

  return null;
}
