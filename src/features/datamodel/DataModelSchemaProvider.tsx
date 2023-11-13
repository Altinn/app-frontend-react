import React from 'react';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { JSONSchema7 } from 'json-schema';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { createStrictQueryContext } from 'src/features/contexts/queryContext';
import { DataModelActions } from 'src/features/datamodel/datamodelSlice';
import { useCurrentDataModelName } from 'src/features/datamodel/useBindingSchema';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { Loader } from 'src/features/loading/Loader';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export interface IDataModelSchemaContext {
  dataModelSchema: JSONSchema7 | undefined;
  dataModelName: string | undefined;
}

const useDataModelSchemaQuery = (dataModelName: string | undefined): UseQueryResult<JSONSchema7> => {
  const dispatch = useAppDispatch();
  const { fetchDataModelSchema } = useAppQueries();
  return useQuery({
    queryKey: ['fetchDataModelSchemas', dataModelName],
    queryFn: () => fetchDataModelSchema(dataModelName || ''),
    enabled: !!dataModelName,
    onSuccess: (schema) => {
      dispatch(DataModelActions.fetchFulfilled({ id: dataModelName || '', schema }));
    },
    onError: (error: HttpClientError) => {
      if (error.status === 404) {
        window.logWarn('Data model schema not found:\n', error);
      } else {
        window.logError('Data model schema request failed:\n', error);
      }
    },
  });
};

const { Provider, useCtx } = createStrictQueryContext<JSONSchema7>({
  name: 'DataModelSchema',
  useQuery: useDataModelSchemaQuery,
  // PRIORITY: Provide argument and/or fix implementation
});

export function DataModelSchemaProvider({ children }: React.PropsWithChildren) {
  const dataModelName = useCurrentDataModelName();
  const { data: dataModelSchema, isLoading, error } = useDataModelSchemaQuery(dataModelName);

  if (error) {
    return <UnknownError />;
  }

  if (isLoading && dataModelName) {
    return (
      <Loader
        reason='data-model-schema'
        details={dataModelName}
      />
    );
  }

  return <Provider value={{ dataModelSchema, dataModelName }}>{children}</Provider>;
}
