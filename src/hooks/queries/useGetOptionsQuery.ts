import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { OptionsActions } from 'src/features/options/optionsSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { getOptionsUrl } from 'src/utils/urls/appUrlHelper';
import type { IMapping, IOption } from 'src/layout/common.generated';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';
export const useGetOptionsQuery = (
  optionsId: string | undefined,
  mapping?: IMapping,
  queryParameters?: Record<string, string>,
  secure?: boolean,
  setMetadata?: (value: string | undefined) => void,
): UseQueryResult<IOption[]> => {
  const dispatch = useAppDispatch();
  const { fetchOptions } = useAppQueries();
  const formData = useAppSelector((state) => state.formData.formData);
  const langTools = useLanguage();
  const language = langTools.selectedLanguage;
  const { instanceId } = window;

  const url = getOptionsUrl({
    optionsId: optionsId || '',
    formData,
    language,
    dataMapping: mapping,
    fixedQueryParameters: queryParameters,
    secure,
    instanceId,
  });

  const queryFunction = async (url: string) => {
    const response = await fetchOptions(url);
    const downstreamParameters: string = response.headers['altinn-downstreamparameters'];
    if (setMetadata && downstreamParameters) {
      setMetadata(downstreamParameters);
    }
    return response.data;
  };

  return useQuery({
    queryKey: [url],
    queryFn: () => queryFunction(url),
    enabled: !!optionsId,
    onError: (error: HttpClientError) => {
      dispatch(OptionsActions.fetchRejected({ error }));
    },
  });
};
