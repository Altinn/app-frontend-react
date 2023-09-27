import type { AxiosRequestConfig } from 'axios';
import type { JSONSchema7 } from 'json-schema';

import { httpPost } from 'src/utils/network/networking';
import { httpGet } from 'src/utils/network/sharedNetworking';
import {
  applicationMetadataApiUrl,
  applicationSettingsApiUrl,
  currentPartyUrl,
  getActiveInstancesUrl,
  getFooterLayoutUrl,
  getJsonSchemaUrl,
  getLayoutSetsUrl,
  getPartyValidationUrl,
  profileApiUrl,
  refreshJwtTokenUrl,
  validPartiesUrl,
} from 'src/utils/urls/appUrlHelper';
import { orgsListUrl } from 'src/utils/urls/urlHelper';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IDataList } from 'src/features/dataLists';
import type { IFooterLayout } from 'src/features/footer/types';
import type { IPartyValidationResponse } from 'src/features/party';
import type { IOption } from 'src/layout/common.generated';
import type { ILayoutSets, ISimpleInstance } from 'src/types';
import type { IAltinnOrgs, IApplicationSettings, IProfile } from 'src/types/shared';

export const doPartyValidation = async (partyId: string): Promise<IPartyValidationResponse> =>
  (await httpPost(getPartyValidationUrl(partyId))).data;

export const fetchActiveInstances = (partyId: string): Promise<ISimpleInstance[]> =>
  httpGet(getActiveInstancesUrl(partyId));

export const fetchApplicationMetadata = (): Promise<IApplicationMetadata> => httpGet(applicationMetadataApiUrl);

export const fetchApplicationSettings = (): Promise<IApplicationSettings> => httpGet(applicationSettingsApiUrl);

export const fetchCurrentParty = () => httpGet(currentPartyUrl);

export const fetchFooterLayout = (): Promise<IFooterLayout> => httpGet(getFooterLayoutUrl());

export const fetchLayoutSets = (): Promise<ILayoutSets> => httpGet(getLayoutSetsUrl());

export const fetchOptions = (url: string): Promise<IOption[]> => httpGet(url);

export const fetchDataList = (url: string): Promise<IDataList> => httpGet(url);

export const fetchOrgs = (): Promise<{ orgs: IAltinnOrgs }> =>
  httpGet(orgsListUrl, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

export const fetchParties = () => httpGet(validPartiesUrl);

export const fetchRefreshJwtToken = () => httpGet(refreshJwtTokenUrl);

export const fetchUserProfile = (): Promise<IProfile> => httpGet(profileApiUrl);
export const fetchDataModelSchema = (dataTypeName: string): Promise<JSONSchema7> =>
  httpGet(getJsonSchemaUrl() + dataTypeName);

export const fetchFormData = (url: string, options?: AxiosRequestConfig): Promise<any> => httpGet(url, options);
