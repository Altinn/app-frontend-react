import { useQuery } from '@tanstack/react-query';
import type { JSONSchema7 } from 'json-schema';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { createLaxQueryContext } from 'src/features/contexts/queryContext';
import { DataModelActions } from 'src/features/datamodel/datamodelSlice';
import { useCurrentDataModelName } from 'src/features/datamodel/useBindingSchema';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export interface IDataModelSchemaContext {
  dataModelSchema: JSONSchema7;
  dataModelName: string;
}

const useDataModelSchemaQuery = () => {
  const dispatch = useAppDispatch();
  const { fetchDataModelSchema } = useAppQueries();
  const dataModelName = useCurrentDataModelName();
  const enabled = !!dataModelName;

  const utils = useQuery({
    enabled,
    queryKey: ['fetchDataModelSchemas', dataModelName],
    queryFn: async () => {
      const schema = await fetchDataModelSchema(dataModelName!);
      const out: IDataModelSchemaContext = {
        dataModelSchema: schema,
        dataModelName: dataModelName!,
      };

      return out;
    },
    onSuccess: (result) => {
      dispatch(DataModelActions.fetchFulfilled({ id: dataModelName || '', schema: result.dataModelSchema }));
    },
    onError: (error: HttpClientError) => {
      if (error.status === 404) {
        window.logWarn('Data model schema not found:\n', error);
      } else {
        window.logError('Data model schema request failed:\n', error);
      }
    },
  });

  return {
    ...utils,
    enabled,
  };
};

const { Provider, useCtx } = createLaxQueryContext<IDataModelSchemaContext>({
  name: 'DataModelSchema',
  useQuery: useDataModelSchemaQuery,
});

export const DataModelSchemaProvider = Provider;
export const useDataModelSchema = useCtx;
