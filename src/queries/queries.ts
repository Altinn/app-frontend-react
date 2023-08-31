import { httpPost } from 'src/utils/network/networking';
import { httpGet } from 'src/utils/network/sharedNetworking';
import {
  applicationMetadataApiUrl,
  applicationSettingsApiUrl,
  currentPartyUrl,
  getActiveInstancesUrl,
  getFetchFormDataUrl,
  getFooterLayoutUrl,
  getLayoutSetsUrl,
  getLayoutsUrl,
  getOptionsUrl,
  getPartyValidationUrl,
  instancesControllerUrl,
  profileApiUrl,
  refreshJwtTokenUrl,
  validPartiesUrl,
} from 'src/utils/urls/appUrlHelper';
import { orgsListUrl } from 'src/utils/urls/urlHelper';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IFooterLayout } from 'src/features/footer/types';
import type { IFormData } from 'src/features/formData';
import type { ILayoutSets, ISimpleInstance } from 'src/types';
import type { IAltinnOrgs, IApplicationSettings, IProfile } from 'src/types/shared';
import type { IGetOptionsUrlParams } from 'src/utils/urls/appUrlHelper';

export const doPartyValidation = (partyId: string) => httpPost(getPartyValidationUrl(partyId));

export const fetchActiveInstances = (partyId: string): Promise<ISimpleInstance[]> =>
  httpGet(getActiveInstancesUrl(partyId));

export const fetchCurrentInstance = (instanceId: string): Promise<ISimpleInstance> =>
  httpGet(`${instancesControllerUrl}/${instanceId}`);

export const fetchApplicationMetadata = (): Promise<IApplicationMetadata> => httpGet(applicationMetadataApiUrl);

export const fetchApplicationSettings = (): Promise<IApplicationSettings> => httpGet(applicationSettingsApiUrl);

export const fetchCurrentParty = () => httpGet(currentPartyUrl);

export const fetchParties = () => httpGet(validPartiesUrl);

export const fetchFooterLayout = (): Promise<IFooterLayout> => httpGet(getFooterLayoutUrl());

export const fetchLayoutSets = (): Promise<ILayoutSets> => httpGet(getLayoutSetsUrl());

export const fetchLayout = (instanceId: string | null): Promise<ILayoutSets> => httpGet(getLayoutsUrl(instanceId));

export const fetchFormData = (instanceId: string, currentTaskDataElementId: string): Promise<IFormData> =>
  httpGet(getFetchFormDataUrl(instanceId, currentTaskDataElementId));

export const fetchOptions = (
  optionsId,
  formData,
  language,
  dataMapping,
  fixedQueryParameters,
  secure,
  instanceId,
): Promise<IGetOptionsUrlParams> =>
  httpGet(getOptionsUrl({ optionsId, formData, language, dataMapping, fixedQueryParameters, secure, instanceId }));

export const fetchOrgs = (): Promise<{ orgs: IAltinnOrgs }> =>
  httpGet(orgsListUrl, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

export const fetchUserProfile = (): Promise<IProfile> => httpGet(profileApiUrl);

export const fetchRefreshJwtToken = () => httpGet(refreshJwtTokenUrl);
