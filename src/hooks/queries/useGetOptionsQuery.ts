import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { useLanguage } from 'src/hooks/useLanguage';
import type { IOption } from 'src/layout/common.generated';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export const useGetOptionsQuery = (
  instanceId: string,
  optionsId: string,
  formData,
  mapping,
  queryParameters,
  secure,
  enabled?: boolean,
): UseQueryResult<IOption[]> => {
  const { fetchOptions } = useAppQueriesContext();
  const langTools = useLanguage();
  const language = langTools.selectedLanguage;

  return useQuery(
    [optionsId],
    () => fetchOptions(optionsId, formData, language, mapping, queryParameters, secure, instanceId),
    {
      enabled,
      onSuccess: () => {},
      onError: (error: HttpClientError) => {
        console.warn(error);
        throw new Error('Failed to fetch options');
      },
    },
  );
};
