import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { FD } from 'src/features/formData2/Compatibility';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { OptionsActions } from 'src/features/options/optionsSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useLanguage } from 'src/hooks/useLanguage';
import { getOptionsUrl } from 'src/utils/urls/appUrlHelper';
import type { IMapping, IOption } from 'src/layout/common.generated';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';
export const useGetOptionsQuery = (
  optionsId: string | undefined,
  mapping?: IMapping,
  queryParameters?: Record<string, string>,
  secure?: boolean,
): UseQueryResult<AxiosResponse<IOption[], any>> => {
  const dispatch = useAppDispatch();
  const { fetchOptions } = useAppQueries();
  const formData = FD.useAsDotMap();
  const langTools = useLanguage();
  const language = langTools.selectedLanguage;
  const instanceId = useLaxInstance()?.instanceId;

  const url = getOptionsUrl({
    optionsId: optionsId || '',
    formData,
    language,
    dataMapping: mapping,
    fixedQueryParameters: queryParameters,
    secure,
    instanceId,
  });

  return useQuery({
    queryKey: [url],
    queryFn: () => fetchOptions(url),
    enabled: !!optionsId,
    onError: (error: HttpClientError) => {
      dispatch(OptionsActions.fetchRejected({ error }));
    },
  });
};
