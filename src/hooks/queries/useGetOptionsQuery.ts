import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import type { IMapping, IOption } from 'src/layout/common.generated';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export const useGetOptionsQuery = (
  optionsId: string | undefined,
  mapping?: IMapping,
  queryParameters?: Record<string, string>,
  secure?: boolean,
  enabled?: boolean,
): UseQueryResult<IOption[]> => {
  const { fetchOptions } = useAppQueriesContext();
  const formData = useAppSelector((state) => state.formData.formData);
  const langTools = useLanguage();
  const language = langTools.selectedLanguage;
  const { instanceId } = window;
  return useQuery(
    [optionsId],
    () => fetchOptions(optionsId, formData, language, mapping, queryParameters, secure, instanceId),
    {
      enabled,
      onSuccess: () => {},
      onError: (error: HttpClientError) => {
        console.warn(error);
        // throw new Error('Failed to fetch options');
      },
    },
  );
};
