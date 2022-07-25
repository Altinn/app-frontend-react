import { mapFormData } from 'src/utils/databindings';
import type { IFormData } from 'src/features/form/data';
import type { IAltinnWindow, IMapping } from 'src/types';

const altinnWindow = window as Window as IAltinnWindow;
const { org, app } = altinnWindow;
const origin = window.location.origin;

export const appPath = `${org}/${app}`;
export const fullAppPath = `${origin}/${appPath}`;
export const profileApiUrl = `${fullAppPath}/api/v1/profile/user`;
export const oldTextResourcesUrl = `${origin}/${org}/${app}/api/textresources`;
export const applicationMetadataApiUrl = `${fullAppPath}/api/v1/applicationmetadata`;
export const applicationSettingsApiUrl = `${fullAppPath}/api/v1/applicationsettings`;
export const updateCookieUrl = (partyId: string) =>
  `${fullAppPath}/api/v1/parties/${partyId}`;
export const invalidateCookieUrl = `${fullAppPath}/api/authentication/invalidatecookie`;
export const validPartiesUrl = `${fullAppPath}/api/v1/parties?allowedtoinstantiatefilter=true`;
export const currentPartyUrl = `${fullAppPath}/api/authorization/parties/current?returnPartyObject=true`;
export const instancesControllerUrl = `${fullAppPath}/instances`;
export const refreshJwtTokenUrl = `${fullAppPath}/api/authentication/keepAlive`;

export function textResourcesUrl(language: string) {
  return `${origin}/${org}/${app}/api/v1/texts/${language}`;
}

export function fileUploadUrl(attachmentType: string) {
  return (
    `${fullAppPath}/instances/` +
    `${altinnWindow.instanceId}/data?dataType=${attachmentType}`
  );
}

export function fileTagUrl(dataGuid: string) {
  return (
    `${fullAppPath}/instances/` +
    `${altinnWindow.instanceId}/data/${dataGuid}/tags`
  );
}

export function dataElementUrl(dataGuid: string) {
  return `${fullAppPath}/instances/${altinnWindow.instanceId}/data/${dataGuid}`;
}

export function getProcessStateUrl() {
  return `${fullAppPath}/instances/${altinnWindow.instanceId}/process`;
}

export function getCreateInstancesUrl(partyId: string) {
  return `${fullAppPath}/instances?instanceOwnerPartyId=${partyId}`;
}

export function getValidationUrl(instanceId: string) {
  return `${fullAppPath}/instances/${instanceId}/validate`;
}

export function getDataValidationUrl(instanceId: string, dataGuid: string) {
  return `${fullAppPath}/instances/${instanceId}/data/${dataGuid}/validate`;
}

export function getCompleteProcessUrl() {
  return `${fullAppPath}/instances/${altinnWindow.instanceId}/process/next`;
}

export function getRedirectUrl(returnUrl: string) {
  return `${fullAppPath}/api/v1/redirect?url=${encodeURIComponent(returnUrl)}`;
}

export function getUpgradeAuthLevelUrl(reqAuthLevel: string) {
  const redirect: string =
    `https://platform.${getHostname()}` +
    `/authentication/api/v1/authentication?goto=${fullAppPath}`;
  return `https://${getHostname()}/ui/authentication/upgrade?goTo=${encodeURIComponent(
    redirect,
  )}&reqAuthLevel=${reqAuthLevel}`;
}

export const getEnvironmentLoginUrl = (oidcprovider: string) => {
  // First split away the protocol 'https://' and take the last part. Then split on dots.
  const domainSplitted: string[] = window.location.host.split('.');
  const encodedGoToUrl = encodeURIComponent(window.location.href);
  let issParam = '';
  if (oidcprovider != null && oidcprovider != '') {
    issParam = `&iss=${oidcprovider}`;
  }

  if (domainSplitted.length === 5) {
    return (
      `https://platform.${domainSplitted[2]}.${domainSplitted[3]}.${domainSplitted[4]}` +
      `/authentication/api/v1/authentication?goto=${encodedGoToUrl}${issParam}`
    );
  }

  if (domainSplitted.length === 4) {
    return (
      `https://platform.${domainSplitted[2]}.${domainSplitted[3]}` +
      `/authentication/api/v1/authentication?goto=${encodedGoToUrl}${issParam}`
    );
  }

  // TODO: what if altinn3?
  throw new Error('Unknown domain');
};

export const getHostname: () => string = () => {
  // First split away the protocol 'https://' and take the last part. Then split on dots.
  const domainSplitted: string[] = window.location.host.split('.');
  if (domainSplitted.length === 5) {
    return `${domainSplitted[2]}.${domainSplitted[3]}.${domainSplitted[4]}`;
  }
  if (domainSplitted.length === 4) {
    return `${domainSplitted[2]}.${domainSplitted[3]}`;
  }
  if (domainSplitted.length === 2 && domainSplitted[0] === 'altinn3local') {
    // Local test
    return window.location.host;
  }
  throw new Error('Unknown domain');
};

export const redirectToUpgrade = (reqAuthLevel: string) => {
  window.location.href = getUpgradeAuthLevelUrl(reqAuthLevel);
};

export function getJsonSchemaUrl() {
  return `${fullAppPath}/api/jsonschema/`;
}

export function getLayoutSettingsUrl(layoutset: string) {
  if (layoutset === null) {
    return `${fullAppPath}/api/layoutsettings`;
  }
  return `${fullAppPath}/api/layoutsettings/${layoutset}`;
}

export function getLayoutSetsUrl() {
  return `${fullAppPath}/api/layoutsets`;
}

export function getFetchFormDataUrl(instanceId: string, dataElementId: string) {
  return `${fullAppPath}/instances/${instanceId}/data/${dataElementId}`;
}

export function getStatelessFormDataUrl(dataType: string, anonymous = false) {
  if (anonymous) {
    return `${fullAppPath}/v1/data/anonymous?dataType=${dataType}`;
  }
  return `${fullAppPath}/v1/data?dataType=${dataType}`;
}

export function getFetchFormDynamicsUrl(layoutSetId?: string) {
  if (layoutSetId) {
    return `${fullAppPath}/api/ruleconfiguration/${layoutSetId}`;
  }
  return `${fullAppPath}/api/resource/RuleConfiguration.json`;
}

export function getLayoutsUrl(layoutset: string) {
  if (layoutset === null) {
    return `${fullAppPath}/api/resource/FormLayout.json`;
  }
  return `${fullAppPath}/api/layouts/${layoutset}`;
}

export function getRulehandlerUrl(layoutset: string) {
  if (layoutset === null) {
    return `${fullAppPath}/api/resource/RuleHandler.js`;
  }
  return `${fullAppPath}/api/rulehandler/${layoutset}`;
}

export function getCalculatePageOrderUrl(stateless: boolean) {
  if (stateless) {
    return `${fullAppPath}/v1/pages/order`;
  } else {
    return `${fullAppPath}/instances/${altinnWindow.instanceId}/pages/order`;
  }
}

export function getPartyValidationUrl(partyId: string) {
  return `${fullAppPath}/api/v1/parties/validateInstantiation?partyId=${partyId}`;
}

export function getActiveInstancesUrl(partyId: string) {
  return `${fullAppPath}/instances/${partyId}/active`;
}

export function getInstanceUiUrl(instanceId: string) {
  return `${fullAppPath}/instance/${instanceId}`;
}

export interface IGetOptionsUrlParams {
  optionsId: string;
  dataMapping?: IMapping;
  formData?: IFormData;
  language?: string;
  secure?: boolean;
  instanceId?: string;
}

export const getOptionsUrl = ({
  optionsId,
  dataMapping,
  formData,
  language,
  secure,
  instanceId,
}: IGetOptionsUrlParams) => {
  let url: URL;
  if (secure) {
    url = new URL(
      `${fullAppPath}/instances/${instanceId}/options/${optionsId}`,
    );
  } else {
    url = new URL(`${fullAppPath}/api/options/${optionsId}`);
  }
  let params: Record<string, string> = {};

  if (language) {
    params.language = language;
  }

  if (formData && dataMapping) {
    const mapped = mapFormData(formData, dataMapping);

    params = {
      ...params,
      ...mapped,
    };
  }

  url.search = new URLSearchParams(params).toString();
  return url.toString();
};
