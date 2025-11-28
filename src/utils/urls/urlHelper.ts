export const altinnAppsIllustrationHelpCircleSvgUrl = 'https://altinncdn.no/img/illustration-help-circle.svg';
export const orgsListUrl = 'https://altinncdn.no/orgs/altinn-orgs.json';
export const baseHostnameAltinnProd = 'altinn.no';
export const baseHostnameAltinnTest = 'altinn.cloud';
export const baseHostnameAltinnLocal = 'altinn3local.no';
export const baseHostnameAltinnLocalCloud = 'local.altinn.cloud';
export const pathToProfile = 'ui/profile';
export const pathToAllSchemas = 'skjemaoversikt';
const prodRegex = new RegExp(baseHostnameAltinnProd);
const testRegex = new RegExp(baseHostnameAltinnTest);
const localRegex = new RegExp(baseHostnameAltinnLocal);
const localCloudRegex = new RegExp(baseHostnameAltinnLocalCloud);
const testEnvironmentRegex = /^(at|tt|yt)\d+\.(altinn\.(no|cloud))$/;

function extractHostFromUrl(url: string): string | null {
  if (url.search(prodRegex) >= 0) {
    const split = url.split('.');
    const env = split[split.length - 3];
    if (env === 'tt02') {
      return `${env}.${baseHostnameAltinnProd}`;
    }
    return baseHostnameAltinnProd;
  } else if (url.search(testRegex) >= 0) {
    const split = url.split('.');
    const env = split[split.length - 3];
    return `${env}.${baseHostnameAltinnTest}`;
  }
  return null;
}

function buildArbeidsflateUrl(host: string): string {
  if (host === baseHostnameAltinnProd) {
    return `https://af.${baseHostnameAltinnProd}/`;
  }

  const envMatch = host.match(testEnvironmentRegex);
  if (envMatch) {
    const [, env, domain] = envMatch;
    return `https://af.${env}.${domain}/`;
  }

  // Fallback for other environments
  return `https://af.${host}/`;
}

function redirectAndChangeParty(baseUrl: string, goTo: string, partyId: string | number): string {
  return `${baseUrl}ui/Reportee/ChangeReporteeAndRedirect?goTo=${encodeURIComponent(goTo)}&R=${partyId}`;
}

export function getDialogIdFromDataValues(dataValues: unknown): string | undefined {
  const data = dataValues as Record<string, unknown> | null | undefined;
  const id = data?.['dialog.id'];
  if (typeof id === 'string') {
    return id;
  }
  if (typeof id === 'number') {
    return String(id);
  }
  return undefined;
}

export const returnUrlToMessagebox = (url: string, partyId?: string | number, dialogId?: string): string | null => {
  if (url.search(localCloudRegex) >= 0 || url.search(localRegex) >= 0) {
    return '/';
  }

  const host = extractHostFromUrl(url);
  if (!host) {
    return null;
  }

  const arbeidsflateUrl = buildArbeidsflateUrl(host);
  const targetUrl = dialogId ? `${arbeidsflateUrl.replace(/\/$/, '')}/inbox/${dialogId}` : arbeidsflateUrl;

  if (partyId === undefined) {
    return targetUrl;
  }

  const baseUrl = returnBaseUrlToAltinn(url);
  if (!baseUrl) {
    return targetUrl;
  }

  return redirectAndChangeParty(baseUrl, targetUrl, partyId);
};

export const returnUrlFromQueryParameter = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('returnUrl');
};

export const returnUrlToArchive = (url: string, partyId?: string | number, dialogId?: string): string | null => {
  if (url.search(localCloudRegex) >= 0 || url.search(localRegex) >= 0) {
    return '/';
  }

  const host = extractHostFromUrl(url);
  if (!host) {
    return null;
  }

  const arbeidsflateUrl = buildArbeidsflateUrl(host);
  const targetUrl = dialogId ? `${arbeidsflateUrl.replace(/\/$/, '')}/inbox/${dialogId}` : arbeidsflateUrl;

  if (partyId === undefined) {
    return targetUrl;
  }

  const baseUrl = returnBaseUrlToAltinn(url);
  if (!baseUrl) {
    return targetUrl;
  }

  return redirectAndChangeParty(baseUrl, targetUrl, partyId);
};

export const returnUrlToProfile = (url: string, _partyId?: string | undefined): string | null => {
  if (url.search(localCloudRegex) >= 0 || url.search(localRegex) >= 0) {
    return '/profile';
  }

  const host = extractHostFromUrl(url);
  if (!host) {
    return null;
  }

  const arbeidsflateUrl = buildArbeidsflateUrl(host);
  return `${arbeidsflateUrl.replace(/\/$/, '')}/profile`;
};

export const returnUrlToAllSchemas = (url: string): string | null => {
  const baseUrl = returnBaseUrlToAltinn(url);
  if (!baseUrl) {
    return null;
  }
  return baseUrl + pathToAllSchemas;
};

export const returnBaseUrlToAltinn = (url: string): string | null => {
  let result: string | null;
  if (url.search(localCloudRegex) >= 0 || url.search(localRegex) >= 0) {
    result = '/';
  } else if (url.search(prodRegex) >= 0) {
    const split = url.split('.');
    const env = split[split.length - 3];
    if (env === 'tt02') {
      result = `https://${env}.${baseHostnameAltinnProd}/`;
    } else {
      result = `https://${baseHostnameAltinnProd}/`;
    }
  } else if (url.search(testRegex) >= 0) {
    const split = url.split('.');
    const env = split[split.length - 3];
    result = `https://${env}.${baseHostnameAltinnTest}/`;
  } else {
    result = null;
  }
  return result;
};

export function customEncodeURI(uri: string): string {
  let result: string;
  result = encodeURIComponent(uri);
  result = result.replace(/[/(]/gi, '%28').replace(/[/)]/gi, '%29');
  return result;
}

export const logoutUrlAltinn = (url: string): string => `${returnBaseUrlToAltinn(url)}ui/authentication/LogOut`;

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
  } catch (e) {
    //ignore invalid (or dummy) urls
  }
  return url;
};

/**
 * Returns an encoded query string from a key-value object, or an empty string if the object is empty.
 * Also removes parameters that are empty, null, or undefined.
 * Example: { a: 'b', c: 'd' } => '?a=b&c=d'
 * Example: {} => ''
 * Example: { a: 'b', c: null } => '?a=b'
 */
export function getQueryStringFromObject(obj: Record<string, string | null | undefined>): string {
  const cleanObj = Object.fromEntries(Object.entries(obj).filter(([_, value]) => value)) as Record<string, string>;
  const queryParams = new URLSearchParams(cleanObj);
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}
