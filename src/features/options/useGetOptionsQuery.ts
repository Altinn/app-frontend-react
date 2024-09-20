import { skipToken, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AxiosError, AxiosResponse } from 'axios';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { castOptionsToStrings } from 'src/features/options/castOptionsToStrings';
import { getOptionsUrl } from 'src/utils/urls/appUrlHelper';
import type { QueryDefinition } from 'src/core/queries/usePrefetchQuery';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { IMapping } from 'src/layout/common.generated';

// Also used for prefetching @see staticOptionsPrefetcher.tsx
export function useGetOptionsQueryDef(url?: string): QueryDefinition<{ data: IOptionInternal[] | undefined }> {
  const { fetchOptions } = useAppQueries();
  return {
    queryKey: ['fetchOptions', url],
    queryFn: url
      ? () =>
          fetchOptions(url).then((result) => ({
            ...result,
            data: castOptionsToStrings(result?.data),
          }))
      : skipToken,
    enabled: !!url,
  };
}

export const useGetOptionsQuery = (
  url: string | undefined,
): UseQueryResult<AxiosResponse<IOptionInternal[], AxiosError>> => useQuery(useGetOptionsQueryDef(url));

export const useGetOptionsUrl = (
  optionsId: string | undefined,
  mapping?: IMapping,
  queryParameters?: Record<string, string>,
  secure?: boolean,
): string | undefined => {
  const mappingResult = FD.useMapping(mapping);
  const language = useCurrentLanguage();
  const instanceId = useLaxInstance()?.instanceId;

  return optionsId
    ? getOptionsUrl({
        optionsId,
        language,
        queryParameters: {
          ...mappingResult,
          ...queryParameters,
        },
        secure,
        instanceId,
      })
    : undefined;
};
