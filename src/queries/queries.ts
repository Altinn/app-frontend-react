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
  getCustomValidationConfigUrl,
  getFetchFormDynamicsUrl,
  getFooterLayoutUrl,
  getJsonSchemaUrl,
  getLayoutSetsUrl,
  getLayoutSettingsUrl,
  getLayoutsUrl,
  getPartyValidationUrl,
  getPdfFormatUrl,
  getProcessNextUrl,
  getProcessStateUrl,
  getRulehandlerUrl,
  instancesControllerUrl,
  instantiateUrl,
  profileApiUrl,
  refreshJwtTokenUrl,
  validPartiesUrl,
} from 'src/utils/urls/appUrlHelper';
import { orgsListUrl } from 'src/utils/urls/urlHelper';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IDataList } from 'src/features/dataLists';
import type { IFormDynamics } from 'src/features/dynamics';
import type { IFooterLayout } from 'src/features/footer/types';
import type { Instantiation } from 'src/features/instantiate/InstantiationContext';
import type { IPartyValidationResponse } from 'src/features/party';
import type { IPdfFormat } from 'src/features/pdf/types';
import type { ILayoutFileExternal, IOption } from 'src/layout/common.generated';
import type { ILayoutCollection } from 'src/layout/layout';
import type { ILayoutSets, ILayoutSettings, ISimpleInstance } from 'src/types';
import type {
  IActionType,
  IAltinnOrgs,
  IAppLanguage,
  IApplicationSettings,
  IInstance,
  IProcess,
  IProfile,
} from 'src/types/shared';
import type { IExpressionValidationConfig } from 'src/utils/validation/types';

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

export const fetchInstanceData = (partyId: string, instanceGuid: string): Promise<IInstance> =>
  httpGet(`${instancesControllerUrl}/${partyId}/${instanceGuid}`);

export const fetchProcessState = (instanceId: string): Promise<IProcess> => httpGet(getProcessStateUrl(instanceId));

export const fetchProcessNextSteps = (): Promise<string[]> => httpGet(getProcessNextUrl());

export const fetchApplicationMetadata = (): Promise<IApplicationMetadata> => httpGet(applicationMetadataApiUrl);

export const fetchApplicationSettings = (): Promise<IApplicationSettings> => httpGet(applicationSettingsApiUrl);

export const fetchCurrentParty = () => httpGet(currentPartyUrl);

export const fetchFooterLayout = (): Promise<IFooterLayout> => httpGet(getFooterLayoutUrl());

export const fetchLayoutSets = (): Promise<ILayoutSets> => httpGet(getLayoutSetsUrl());

export const fetchLayouts = (layoutSetId: string | undefined): Promise<ILayoutCollection | ILayoutFileExternal> =>
  httpGet(getLayoutsUrl(layoutSetId));

export const fetchLayoutSettings = (layoutSetId: string | undefined): Promise<ILayoutSettings> =>
  httpGet(getLayoutSettingsUrl(layoutSetId));

export const fetchOptions = (url: string): Promise<IOption[]> => httpGet(url);

export const fetchDataList = (url: string): Promise<IDataList> => httpGet(url);

export const fetchOrgs = (): Promise<{ orgs: IAltinnOrgs }> =>
  httpGet(orgsListUrl, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

export const fetchParties = () => httpGet(validPartiesUrl);

export const fetchAppLanguages = (): Promise<IAppLanguage[]> => httpGet(applicationLanguagesUrl);

export const fetchRefreshJwtToken = () => httpGet(refreshJwtTokenUrl);

export const fetchCustomValidationConfig = (dataTypeId: string): Promise<IExpressionValidationConfig | null> =>
  httpGet(getCustomValidationConfigUrl(dataTypeId));

export const fetchUserProfile = (): Promise<IProfile> => httpGet(profileApiUrl);

export const fetchDataModelSchema = (dataTypeName: string): Promise<JSONSchema7> =>
  httpGet(getJsonSchemaUrl() + dataTypeName);

export const fetchFormData = (url: string, options?: AxiosRequestConfig): Promise<any> => httpGet(url, options);

export const fetchPdfFormat = (instanceId: string, dataGuid: string): Promise<IPdfFormat> =>
  httpGet(getPdfFormatUrl(instanceId, dataGuid));

export const fetchDynamics = (layoutSetId?: string): Promise<{ data: IFormDynamics } | null> =>
  httpGet(getFetchFormDynamicsUrl(layoutSetId));

export const fetchRuleHandler = (layoutSetId?: string): Promise<string | null> =>
  httpGet(getRulehandlerUrl(layoutSetId));
