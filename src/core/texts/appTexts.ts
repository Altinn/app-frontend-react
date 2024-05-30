import {
  useApplicationMetadata,
  useHasApplicationMetadata,
} from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useHasTextResources } from 'src/features/language/textResources/TextResourcesProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useOrgs } from 'src/hooks/queries/useOrgs';

export function useTextResourceWithFallback(resource: string, fallback?: string | undefined) {
  const { langAsString } = useLanguage();

  const fromResources = langAsString(resource);
  if (fromResources !== resource) {
    return fromResources;
  }

  return fallback;
}

export function useHasAppTextsYet() {
  const hasAppMetadata = useHasApplicationMetadata();
  const hasTexts = useHasTextResources();

  return hasAppMetadata && hasTexts;
}

export function useAppName() {
  const application = useApplicationMetadata();

  const appName = useTextResourceWithFallback('appName', undefined);
  const oldAppName = useTextResourceWithFallback('ServiceName', undefined);
  const selectedLanguage = useCurrentLanguage();
  const appNameFromMetadata = application.title[selectedLanguage] || application.title.nb;

  return appName || oldAppName || appNameFromMetadata;
}

export function useAppOwner() {
  const application = useApplicationMetadata();
  const fromMetaData = useOrgName(application.org);
  return useTextResourceWithFallback('appOwner', fromMetaData);
}

export function useAppReceiver() {
  const application = useApplicationMetadata();
  const fromMetaData = useOrgName(application.org);
  return useTextResourceWithFallback('appReceiver', fromMetaData);
}

export function useAppLogoAltText() {
  const application = useApplicationMetadata();
  const fromMetaData = useOrgName(application.org);
  return useTextResourceWithFallback('appLogo.altText', fromMetaData);
}

function useOrgName(org: string | undefined) {
  const { data: orgs } = useOrgs();
  const currentLanguage = useCurrentLanguage();

  if (orgs && org && org in orgs) {
    return orgs[org].name[currentLanguage] || orgs[org].name.nb;
  }

  return undefined;
}
