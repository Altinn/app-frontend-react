import React from 'react';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { JSONSchema7 } from 'json-schema';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { DataModelActions } from 'src/features/datamodel/datamodelSlice';
import { useCurrentDataModelName } from 'src/features/datamodel/useBindingSchema';
import { Loader } from 'src/features/isLoading/Loader';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { createStrictContext } from 'src/utils/createContext';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export interface IDataModelSchemaContext {
  dataModelSchema: JSONSchema7;
  dataModelName: string;
}

const { Provider } = createStrictContext<IDataModelSchemaContext>();

const useDataModelSchemaQuery = (): UseQueryResult<JSONSchema7> => {
  const dispatch = useAppDispatch();
  const { fetchDataModelSchema } = useAppQueries();
  const dataModelName = useCurrentDataModelName();
  return useQuery(['fetchDataModelSchemas', dataModelName], () => fetchDataModelSchema(dataModelName || ''), {
    enabled: !!dataModelName,
    onSuccess: (schema) => {
      dispatch(DataModelActions.fetchFulfilled({ id: dataModelName || '', schema }));
    },
    onError: (error: HttpClientError) => {
      if (error.status === 404) {
        dispatch(DataModelActions.fetchRejected({ error: null }));
        window.logWarn('Data model schema not found:\n', error);
      } else {
        dispatch(DataModelActions.fetchRejected({ error }));
        window.logError('Data model schema request failed:\n', error);
      }
    },
  });
};

export function DataModelSchemaProvider({ children }: React.PropsWithChildren) {
  const { data: dataModelSchema, isLoading } = useDataModelSchemaQuery();
  const dataModelName = useCurrentDataModelName();

  if (isLoading || !dataModelSchema || !dataModelName) {
    return <Loader reason='data-model-schema' />;
  }

  return <Provider value={{ dataModelSchema, dataModelName }}>{children}</Provider>;
}
