export const altinnAppsIllustrationHelpCircleSvgUrl = 'https://altinncdn.no/img/illustration-help-circle.svg';
export const orgsListUrl = 'https://altinncdn.no/orgs/altinn-orgs.json';

const redirectAndChangeParty = (goTo: string, partyId: number) =>
  `ui/Reportee/ChangeReporteeAndRedirect?goTo=${encodeURIComponent(goTo)}&R=${partyId}`;

const prodStagingRegex = /^\w+\.apps\.((\w+\.)?altinn\.(no|cloud))$/;
const localRegex = /^local\.altinn\.cloud(:\d+)?$/;
const testEnvironmentRegex = /^(at|tt|yt)\d+\.(altinn\.(no|cloud))$/;

function isLocalEnvironment(host: string): boolean {
  return localRegex.test(host);
}

function extractAltinnHost(host: string): string | undefined {
  const match = host.match(prodStagingRegex);
  return match?.[1];
}

function isProductionEnvironment(altinnHost: string): boolean {
  return altinnHost === 'altinn.no';
}

function buildArbeidsflateUrl(altinnHost: string): string {
  if (isProductionEnvironment(altinnHost)) {
    return 'https://af.altinn.no/';
  }

  const envMatch = altinnHost.match(testEnvironmentRegex);
  if (envMatch) {
    const [, env, domain] = envMatch;
    return `https://af.${env}.${domain}/`;
  }

  return `https://af.${altinnHost}/`;
}

export const returnBaseUrlToAltinn = (host: string): string | undefined => {
  const altinnHost = extractAltinnHost(host);
  if (!altinnHost) {
    return undefined;
  }
  return `https://${altinnHost}/`;
};

/**
 * Returns the URL to the arbeidsflate (workspace) inbox.
 * @param _partyId - Deprecated: Party selection is now handled by arbeidsflate itself
 */
export const getMessageBoxUrl = (_partyId?: number): string | undefined => {
  const host = window.location.host;

  if (isLocalEnvironment(host)) {
    return `http://${host}/`;
  }

  const altinnHost = extractAltinnHost(host);
  if (!altinnHost) {
    return undefined;
  }

  return buildArbeidsflateUrl(altinnHost);
};

export const returnUrlToArchive = (host: string): string | undefined => {
  if (isLocalEnvironment(host)) {
    return `http://${host}/`;
  }

  const altinnHost = extractAltinnHost(host);
  if (!altinnHost) {
    return undefined;
  }

  return buildArbeidsflateUrl(altinnHost);
};

export const returnUrlToProfile = (host: string, _partyId?: number | undefined): string | undefined => {
  if (isLocalEnvironment(host)) {
    return `http://${host}/profile`;
  }

  const altinnHost = extractAltinnHost(host);
  if (!altinnHost) {
    return undefined;
  }

  const arbeidsflateUrl = buildArbeidsflateUrl(altinnHost);
  return `${arbeidsflateUrl.replace(/\/$/, '')}/profile`;
};

export const returnUrlToAllForms = (host: string): string | undefined => {
  if (host.match(localRegex)) {
    return `http://${host}/`;
  }

  const baseUrl = returnBaseUrlToAltinn(host);
  if (!baseUrl) {
    return;
  }
  return `${baseUrl}skjemaoversikt`;
};

export function logoutUrlAltinn(host: string): string | undefined {
  if (host.match(localRegex)) {
    return `http://${host}/`;
  }

  const baseUrl = returnBaseUrlToAltinn(host);
  if (!baseUrl) {
    return;
  }
  return `${baseUrl}ui/authentication/LogOut`;
}

export function customEncodeURI(uri: string): string {
  let result: string;
  result = encodeURIComponent(uri);
  result = result.replace(/[/(]/gi, '%28').replace(/[/)]/gi, '%29');
  return result;
}

// Storage is always returning https:// links for attachments.
// on localhost (without https) this is a problem, so we make links
// to the same domain as window.location.host relative.
// "https://domain.com/a/b" => "/a/b"
export const makeUrlRelativeIfSameDomain = (url: string, location: Location = window.location) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === location.hostname) {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch (_err) {
    //ignore invalid (or dummy) urls
  }
  return url;
};

function entryHasValue(entry: [string, string | null | undefined]): entry is [string, string] {
  return !!entry[1];
}

/**
 * Returns an encoded query string from a key-value object, or an empty string if the object is empty.
 * Also removes parameters that are empty, null, or undefined.
 * Example: { a: 'b', c: 'd' } => '?a=b&c=d'
 * Example: {} => ''
 * Example: { a: 'b', c: null } => '?a=b'
 */
export function getQueryStringFromObject(obj: Record<string, string | null | undefined>): string {
  const cleanObj = Object.fromEntries(Object.entries(obj).filter(entryHasValue));
  const queryParams = new URLSearchParams(cleanObj);
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function getUrlWithLanguage<T extends string | undefined, R = T extends string ? string : undefined>(
  url: T,
  language: string | undefined,
): R {
  if (typeof url === 'undefined') {
    return undefined as R;
  }
  const urlObj = new URL(url);
  if (typeof language === 'string') {
    urlObj.searchParams.set('language', language);
  } else {
    urlObj.searchParams.delete('language');
  }
  return urlObj.toString() as R;
}
