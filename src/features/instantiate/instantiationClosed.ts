import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { isAxiosError } from 'src/utils/isAxiosError';
import { HttpStatusCodes } from 'src/utils/network/networking';
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

  // The app backend only enforces disallowUserInstantiation in production, so that apps can still be tried out in
  // test environments. Mirror that here, or the frontend would block instantiation where the backend allows it.
  return !!disallowUserInstantiation && isProductionHost(host);
}

/**
 * The app backend responds with 410 Gone when it refuses to create an instance because the service is closed, see
 * isInstantiationClosed for the conditions.
 */
export function isInstantiationClosedError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === HttpStatusCodes.Gone;
}

export function useIsInstantiationClosed(): boolean {
  const applicationMetadata = useApplicationMetadata();
  return isInstantiationClosed(applicationMetadata, new Date(), window.location.host);
}
