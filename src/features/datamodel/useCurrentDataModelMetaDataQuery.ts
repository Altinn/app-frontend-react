import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { useCurrentDataModelName } from 'src/features/datamodel/useBindingSchema';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export interface MetaDataObj {
  jsonSchemaPointer?: string;
  dataBindingName?: string | null;
}

export interface MetaDataMap {
  [key: string]: MetaDataObj;
}

export interface MetaDataResult {
  elements: MetaDataMap;
}

export const useCurrentDataModelMetaDataQuery = (): UseQueryResult<MetaDataResult> => {
  const { fetchDataModelMetaData } = useAppQueriesContext();
  const dataModelName = useCurrentDataModelName();

  return useQuery({
    queryKey: ['fetchDataModelMetaData', dataModelName],
    queryFn: async () => {
      const out = await fetchDataModelMetaData(dataModelName || '');
      if (out) {
        return { ...out, elements: prepareMetaData(out.elements || (out as any).Elements || {}) };
      }

      return out;
    },
    enabled: !!dataModelName,
    onError: (error: HttpClientError) => {
      if (error.status === 404) {
        window.logWarn('Data model meta data not found:\n', error);
      } else {
        window.logError('Data model meta data request failed:\n', error);
      }
    },
  });
};

export function prepareMetaData(metaData: MetaDataMap): MetaDataMap {
  const result: MetaDataMap = {};
  for (const [key, value] of Object.entries(metaData)) {
    result[key] = value;
    if (value.dataBindingName) {
      result[value.dataBindingName] = value;
    }
  }

  return result;
}
