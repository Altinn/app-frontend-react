import { useEffect } from 'react';

import { queryOptions, skipToken, useQuery } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { AxiosError, AxiosRequestConfig } from 'axios';

import { useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useSelectedParty } from 'src/features/party/PartiesProvider';
import { useAllowAnonymous } from 'src/features/stateless/getAllowAnonymous';
import { useAsRef } from 'src/hooks/useAsRef';
import { fetchFormData } from 'src/queries/queries';
import { isAxiosError } from 'src/utils/isAxiosError';
import { putWithoutConfig } from 'src/utils/network/networking';
import {
  getStatefulDataModelUrl,
  getStatelessDataModelUrl,
  invalidateCookieUrl,
  redirectToUpgrade,
} from 'src/utils/urls/appUrlHelper';
import { getUrlWithLanguage } from 'src/utils/urls/urlHelper';

type FormDataKeyParams = {
  isAnonymous: boolean;
  dataType?: string;
  dataElementId?: string;
  prefillFromQueryParams?: string;
  instanceId?: string;
};
type FormDataParams = FormDataKeyParams & { enabled?: boolean; options: AxiosRequestConfig; language: string };

export const formDataQueries = {
  allKey: ['formData'],
  formDataKey: (formDataKeyParams: FormDataKeyParams) => [...formDataQueries.allKey, formDataKeyParams],
  formData: ({ enabled = true, options, language, ...formDataKeyParams }: FormDataParams) => {
    const url = getDataModelUrl({ ...formDataKeyParams, language });
    const queryKey = formDataQueries.formDataKey(formDataKeyParams);

    const queryFn = enabled && url ? () => fetchFormData(url, options) : skipToken;

    if (!formDataKeyParams.dataElementId) {
      //  We need to refetch for stateless apps as caching will break some apps.
      // See this issue: https://github.com/Altinn/app-frontend-react/issues/2564
      return queryOptions({
        queryKey,
        queryFn,
        gcTime: 0,
      });
    }

    return queryOptions({
      queryKey,
      queryFn,
      refetchInterval: false,
    });
  },
};

export async function invalidateFormDataQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: formDataQueries.allKey });
}

type FormDataQueryParams = {
  enabled?: boolean;
  instanceId?: string;
  dataType?: string;
  dataElementId?: string;
  prefillFromQueryParams?: string;
};

export function useFormDataQuery(params: FormDataQueryParams) {
  const language = useCurrentLanguage();
  const isAnonymous = useAllowAnonymous();
  const selectedPartyId = useSelectedParty()?.partyId;
  const options: AxiosRequestConfig = {};
  if (params.dataElementId && selectedPartyId !== undefined) {
    options.headers = {
      party: `partyid:${selectedPartyId}`,
    };
  }
  const query = useQuery(formDataQueries.formData({ ...params, language, isAnonymous, options }));
  const error = query.error;

  useEffect(() => {
    if (error && isAxiosError(error)) {
      if (error.message?.includes('403')) {
        window.logInfo('Current party is missing roles');
      } else {
        window.logError('Fetching form data failed:\n', error);
      }

      maybeAuthenticationRedirect(error);
    }
  }, [error]);

  return query;
}

async function maybeAuthenticationRedirect(error: AxiosError) {
  if (error.response && error.response.status === 403 && error.response.data) {
    const reqAuthLevel = error.response.data['RequiredAuthenticationLevel'];
    if (reqAuthLevel) {
      await putWithoutConfig(invalidateCookieUrl);
      redirectToUpgrade(reqAuthLevel);
    }
  }
}

type DataModelDeps = {
  language: string;
  isAnonymous?: boolean;
  instanceId?: string;
};

type DataModelProps = {
  dataType?: string;
  dataElementId?: string;
  language?: string;
  prefillFromQueryParams?: string;
};

function getDataModelUrl({
  dataType,
  dataElementId,
  isAnonymous = false,
  language,
  instanceId,
  prefillFromQueryParams,
}: DataModelDeps & DataModelProps) {
  if (!instanceId && dataType) {
    return getUrlWithLanguage(getStatelessDataModelUrl({ dataType, prefillFromQueryParams, isAnonymous }), language);
  }

  if (instanceId && dataElementId) {
    return getUrlWithLanguage(getStatefulDataModelUrl(instanceId, dataElementId), language);
  }

  return undefined;
}

export function useGetDataModelUrl() {
  const isAnonymous = useAllowAnonymous();
  const instanceId = useLaxInstanceId();
  const currentLanguage = useAsRef(useCurrentLanguage());

  return ({ dataType, dataElementId, language, prefillFromQueryParams }: DataModelProps) =>
    getDataModelUrl({
      dataType,
      dataElementId,
      language: language ?? currentLanguage.current,
      isAnonymous,
      instanceId,
      prefillFromQueryParams,
    });
}
