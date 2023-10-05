import type { AxiosRequestConfig } from 'axios';
import type { JSONSchema7 } from 'json-schema';

import { httpPost } from 'src/utils/network/networking';
import { httpGet, httpPut } from 'src/utils/network/sharedNetworking';
import {
  applicationLanguagesUrl,
  applicationMetadataApiUrl,
  applicationSettingsApiUrl,
  currentPartyUrl,
  getActiveInstancesUrl,
  getCreateInstancesUrl,
  getFooterLayoutUrl,
  getJsonSchemaUrl,
  getLayoutSetsUrl,
  getPartyValidationUrl,
  getProcessNextUrl,
  getProcessStateUrl,
  instancesControllerUrl,
  instantiateUrl,
  profileApiUrl,
  refreshJwtTokenUrl,
  validPartiesUrl,
} from 'src/utils/urls/appUrlHelper';
import { orgsListUrl } from 'src/utils/urls/urlHelper';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IDataList } from 'src/features/dataLists';
import type { IFooterLayout } from 'src/features/footer/types';
import type { IPartyValidationResponse } from 'src/features/party';
import type { Instantiation } from 'src/hooks/queries/useInstance';
import type { IOption } from 'src/layout/common.generated';
import type { ILayoutSets, ISimpleInstance } from 'src/types';
import type {
  IActionType,
  IAltinnOrgs,
  IAppLanguage,
  IApplicationSettings,
  IInstance,
  IProcess,
  IProfile,
} from 'src/types/shared';

/**
 * Mutation functions (these should use httpPost or httpPut and start with 'do')
 */

export const doPartyValidation = async (partyId: string): Promise<IPartyValidationResponse> =>
  (await httpPost(getPartyValidationUrl(partyId))).data;

export const doInstantiateWithPrefill = async (data: Instantiation): Promise<IInstance> =>
  (await httpPost(instantiateUrl, undefined, data)).data;

export const doInstantiate = async (partyId: string): Promise<IInstance> =>
  (await httpPost(getCreateInstancesUrl(partyId))).data;

export const doProcessNext = async (taskId?: string, language?: string, action?: IActionType): Promise<IProcess> =>
  httpPut(getProcessNextUrl(taskId, language), action ? { action } : null);

/**
 * Query functions (these should use httpGet and start with 'fetch')
 */

export const fetchActiveInstances = (partyId: string): Promise<ISimpleInstance[]> =>
  httpGet(getActiveInstancesUrl(partyId));

export const fetchInstanceData = (instanceId: string): Promise<IInstance> =>
  httpGet(`${instancesControllerUrl}/${instanceId}`);

export const fetchProcessState = (instanceId: string): Promise<IProcess> => httpGet(getProcessStateUrl(instanceId));

export const fetchProcessNextSteps = (): Promise<string[]> => httpGet(getProcessNextUrl());

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

export const fetchAppLanguages = (): Promise<IAppLanguage[]> => httpGet(applicationLanguagesUrl);

export const fetchRefreshJwtToken = () => httpGet(refreshJwtTokenUrl);

export const fetchUserProfile = (): Promise<IProfile> => httpGet(profileApiUrl);
export const fetchDataModelSchema = (dataTypeName: string): Promise<JSONSchema7> =>
  httpGet(getJsonSchemaUrl() + dataTypeName);

export const fetchFormData = (url: string, options?: AxiosRequestConfig): Promise<any> => httpGet(url, options);
