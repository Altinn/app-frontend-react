import { usePrefetchQuery } from 'src/core/queries/usePrefetchQuery';
import { usePartiesAllowedToInstantiateQueryDef } from 'src/features/party/PartiesProvider';
import { useShouldFetchProfile } from 'src/features/profile/ProfileProvider';

/**
 * Prefetches parties and current party if applicable
 */
export function PartyPrefetcher() {
  const enabled = useShouldFetchProfile();

  usePrefetchQuery(usePartiesAllowedToInstantiateQueryDef(true), enabled);

  return null;
}
