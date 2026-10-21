import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { isProductionHost } from 'src/utils/urls/urlHelper';
import type { IncomingApplicationMetadata } from 'src/features/applicationMetadata/types';

type InstantiationPreconditions = Pick<IncomingApplicationMetadata, 'validTo' | 'disallowUserInstantiation'>;

// The app backend reads a validTo without an offset as UTC, while JavaScript reads a date-time without an offset as
// local time.
const hasTimeWithoutOffset = /T[^Z+-]*$/i;

function parseValidTo(validTo: string): Date {
  return new Date(hasTimeWithoutOffset.test(validTo) ? `${validTo}Z` : validTo);
}

/**
 * Mirrors the checks the app backend does before creating an instance, so that we can tell the user that the service
 * cannot be started instead of sending a request we know will be rejected. The backend responds with 410 Gone in
 * both cases. Service owners are exempt from disallowUserInstantiation, but they do not use the app frontend.
 */
export function isInstantiationClosed(
  { validTo, disallowUserInstantiation }: InstantiationPreconditions,
  now: Date,
  host: string,
): boolean {
  // An unparsable validTo is left for the backend to judge; it responds with 410 Gone if the app has expired.
  if (validTo && parseValidTo(validTo).getTime() < now.getTime()) {
    return true;
  }

  return !!disallowUserInstantiation && isProductionHost(host);
}

export function useIsInstantiationClosed(): boolean {
  const applicationMetadata = useApplicationMetadata();
  return isInstantiationClosed(applicationMetadata, new Date(), window.location.host);
}
