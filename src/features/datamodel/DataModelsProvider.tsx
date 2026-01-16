import React, { useCallback, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { skipToken, useQueries } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { ContextNotProvided, createContext } from 'src/core/contexts/context';
import { useTaskOverrides } from 'src/core/contexts/TaskOverrides';
import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { getFirstDataElement } from 'src/features/applicationMetadata/appMetadataUtils';
import { getDataModelUrl, useCurrentDataModelName } from 'src/features/datamodel/useBindingSchema';
import { SchemaLookupTool } from 'src/features/datamodel/useDataModelSchemaQuery';
import {
  getAllReferencedDataTypes,
  getValidPrefillDataFromQueryParams,
  MissingClassRefException,
  MissingDataElementException,
  MissingDataTypeException,
  MissingDefaultDataTypeException,
} from 'src/features/datamodel/utils';
import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { getFormDataQueryKey } from 'src/features/formData/useFormDataQuery';
import { useInstanceDataElements, useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useSelectedParty } from 'src/features/party/PartiesProvider';
import { useAllowAnonymous } from 'src/features/stateless/getAllowAnonymous';
import { createValidator } from 'src/features/validation/schemaValidation/schemaValidationUtils';
import { useAsRef } from 'src/hooks/useAsRef';
import { useShallowMemo } from 'src/hooks/useShallowMemo';
import { getRootElementPath } from 'src/utils/schemaUtils';
import type { DataModelSchemaResult } from 'src/features/datamodel/useDataModelSchemaQuery';
import type { IExpressionValidations } from 'src/features/validation';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { IData, IDataType } from 'src/types/shared';

type AllDataModels = {
  defaultDataType: IDataType;
  defaultDataTypeId: string;
  allDataTypes: IDataType[];
  allDataTypeIds: string[];
};

const {
  Provider: AllDataModelsProvider,
  useCtx: useAllDataModelsContext,
  useLaxCtx: useLaxAllDataModelsContext,
} = createContext<AllDataModels>({
  required: true,
  name: 'AllDataModels',
});

export function AllDataModelsContext({ children }: PropsWithChildren) {
  const applicationMetadata = useApplicationMetadata();
  const layouts = useLayouts();
  const defaultDataTypeId = useCurrentDataModelName();
  const defaultDataType = applicationMetadata.dataTypes.find((dt) => dt.id === defaultDataTypeId);

  let error: Error | null = null;
  const _allValidDataTypes: IDataType[] = [];

  if (!defaultDataType) {
    error = new MissingDefaultDataTypeException();
    window.logErrorOnce(error.message);
  }

  if (defaultDataTypeId) {
    const referencedDataTypes = getAllReferencedDataTypes(layouts, defaultDataTypeId);

    // Verify that referenced data types are defined in application metadata, have a classRef, and have a corresponding data element in the instance data
    for (const dataType of referencedDataTypes) {
      const typeDef = applicationMetadata.dataTypes.find((dt) => dt.id === dataType);

      if (!typeDef) {
        error = new MissingDataTypeException(dataType);
        window.logErrorOnce(error.message);
        break;
      }
      if (!typeDef?.appLogic?.classRef) {
        error = new MissingClassRefException(dataType);
        window.logErrorOnce(error.message);
        break;
      }

      _allValidDataTypes.push(typeDef);
    }
  }

  const allDataTypes = useShallowMemo(_allValidDataTypes);
  const allDataTypeIds = useShallowMemo(_allValidDataTypes.map((dt) => dt.id));
  const value = useShallowMemo({ defaultDataType, defaultDataTypeId, allDataTypes, allDataTypeIds });

  if (error) {
    return <DisplayError error={error} />;
  }

  return <AllDataModelsProvider value={value as AllDataModels}>{children}</AllDataModelsProvider>;
}

type DataModelsMetadata = {
  schemaResults: { [dataType: string]: DataModelSchemaResult };
  expressionValidationConfigs: { [dataType: string]: IExpressionValidations | null };
};

const { Provider: DataModelsMetadataProvider, useCtx: useDataModelsMetadataContext } =
  createContext<DataModelsMetadata>({
    required: true,
    name: 'DataModelsMetadata',
  });

export function DataModelsMetadataContext({ children }: PropsWithChildren) {
  const { allDataTypes } = useAllDataModelsContext();
  const { fetchDataModelSchema } = useAppQueries();
  const { fetchCustomValidationConfig } = useAppQueries();

  const schemaQueries = useQueries({
    queries: allDataTypes.map((dataType) => ({
      queryKey: ['fetchDataModelSchemas', dataType.id],
      queryFn: async () => {
        const schema = await fetchDataModelSchema(dataType.id);
        const rootElementPath = getRootElementPath(schema, dataType);
        const lookupTool = new SchemaLookupTool(schema, rootElementPath);
        const validator = createValidator(schema);
        return { schema, validator, rootElementPath, lookupTool };
      },
    })),
  });
  const isSchemaFetching = schemaQueries.some((result) => result.isFetching);
  const isSchemaError = schemaQueries.some((result) => result.error);

  const expressionValidationConfigQueries = useQueries({
    queries: allDataTypes.map((dataType) => ({
      queryKey: ['fetchCustomValidationConfig', dataType.id],
      queryFn: () => fetchCustomValidationConfig(dataType.id),
    })),
  });
  const isExpressionValidationConfigFetching = expressionValidationConfigQueries.some((result) => result.isFetching);
  const isExpressionValidationConfigError = expressionValidationConfigQueries.some((result) => result.error);

  const schemaResults = useShallowMemo(
    Object.fromEntries(allDataTypes.map((dataType, i) => [dataType.id, schemaQueries[i].data])),
  );

  const expressionValidationConfigs = useShallowMemo(
    Object.fromEntries(allDataTypes.map((dataType, i) => [dataType.id, expressionValidationConfigQueries[i].data])),
  );

  const value = useShallowMemo({ schemaResults, expressionValidationConfigs });

  if (isSchemaError || isExpressionValidationConfigError) {
    const error = (schemaQueries.find((result) => result.error)?.error ??
      expressionValidationConfigQueries.find((result) => result.error)?.error)!;
    return <DisplayError error={error} />;
  }

  if (isSchemaFetching || isExpressionValidationConfigFetching) {
    return <Loader reason='data-model-metadata' />;
  }

  return <DataModelsMetadataProvider value={value as DataModelsMetadata}>{children}</DataModelsMetadataProvider>;
}

type InitialData = {
  writableDataTypes: IDataType[];
  writableDataTypeIds: string[];
  defaultDataElement: IData;
  defaultDataElementId: string;
  dataElements: IData[];
  dataElementIds: string[];
  initialData: { [dataType: string]: object };
};

const { Provider: InitialDataProvider, useCtx: useInitialDataContext } = createContext<InitialData>({
  required: true,
  name: 'InitialData',
});

export function InitialDataContext({ children }: PropsWithChildren) {
  const { allDataTypes, defaultDataTypeId } = useAllDataModelsContext();
  const { fetchFormData } = useAppQueries();
  const { dataModelElementId: overriddenDataElementId, dataModelType: overriddenDataType } = useTaskOverrides();
  const instanceDataElements = useInstanceDataElements();
  const metaData = useApplicationMetadata();
  const isStateless = metaData.isStatelessApp;
  const isAnonymous = useAllowAnonymous();
  const instanceId = useLaxInstanceId();
  const currentLanguage = useAsRef(useCurrentLanguage());
  const selectedPartyId = useSelectedParty()?.partyId;
  const options: AxiosRequestConfig = {};
  if (isStateless && selectedPartyId !== undefined) {
    options.headers = {
      party: `partyid:${selectedPartyId}`,
    };
  }

  let error: Error | null = null;

  const dataElements = allDataTypes.map((dataType) =>
    overriddenDataType === dataType.id && overriddenDataElementId
      ? instanceDataElements.find((dataElement) => dataElement.id === overriddenDataElementId)
      : getFirstDataElement(instanceDataElements, dataType.id),
  );
  const dataElementIds = useShallowMemo(dataElements.map((de) => de?.id));

  const writableDataTypes = useShallowMemo(
    allDataTypes.filter((_, i) => isStateless || (!!dataElements[i] && dataElements[i].locked !== true)),
  );
  const writableDataTypeIds = useShallowMemo(writableDataTypes.map((dt) => dt.id));

  const defaultDataElement = dataElements.find((de) => de?.dataType === defaultDataTypeId);
  const defaultDataElementId = defaultDataElement?.id;

  const queries = useQueries({
    queries: allDataTypes.map((dataType, i) => {
      const url = getDataModelUrl({
        dataType: dataType.id,
        dataElementId: dataElements[i]?.id,
        language: currentLanguage.current,
        isAnonymous,
        isStateless,
        instanceId,
        prefillFromQueryParams: getValidPrefillDataFromQueryParams(metaData, dataType.id),
      });
      const queryKey = getFormDataQueryKey(url);
      const queryFn = url ? () => fetchFormData(url, options) : skipToken;

      if (isStateless) {
        //  We need to refetch for stateless apps as caching will break some apps.
        // See this issue: https://github.com/Altinn/app-frontend-react/issues/2564
        return {
          queryKey,
          queryFn,
          gcTime: 0,
        };
      }

      return {
        queryKey,
        queryFn,
        refetchInterval: false,
      };
    }),
  });
  const isFetching = queries.some((result) => result.isFetching);
  error ??= queries.find((result) => result.error)?.error ?? null;

  const initialData = useShallowMemo(
    Object.fromEntries(allDataTypes.map((dataType, i) => [dataType.id, queries[i].data])),
  );

  const value = useShallowMemo({
    writableDataTypes,
    writableDataTypeIds,
    defaultDataElement,
    defaultDataElementId,
    dataElements,
    dataElementIds,
    initialData,
  });

  if (dataElements.some((de) => !de)) {
    error = new MissingDataElementException(allDataTypes.find((_, i) => !dataElements[i])!.id);
    window.logErrorOnce(error.message);
  }

  if (error) {
    return <DisplayError error={error} />;
  }

  if (isFetching) {
    return <Loader reason='data-model-initial-data' />;
  }

  return <InitialDataProvider value={value as InitialData}>{children}</InitialDataProvider>;
}

function laxSelect<T, R>(ctx: T | typeof ContextNotProvided, selector: (ctx: T) => R): R | typeof ContextNotProvided {
  if (ctx === ContextNotProvided) {
    return ContextNotProvided;
  }
  return selector(ctx);
}

function select<T, R>(ctx: T, selector: (ctx: T) => R): R {
  return selector(ctx);
}

export const DataModels = {
  useDefaultDataType: () => useAllDataModelsContext().defaultDataType.id,
  useLaxDefaultDataType: () => laxSelect(useLaxAllDataModelsContext(), (ctx) => ctx.defaultDataTypeId),

  useInitialData: () => useInitialDataContext().initialData,

  // The following hooks use emptyArray if the value is null, so cannot be used to determine whether or not the datamodels are finished loading
  useReadableDataTypes: () => useAllDataModelsContext().allDataTypeIds,
  useLaxReadableDataTypes: () => laxSelect(useLaxAllDataModelsContext(), (ctx) => ctx.allDataTypeIds),
  useWritableDataTypes: () => useInitialDataContext().writableDataTypeIds,

  useDataModelSchema: (dataType: string) => useDataModelsMetadataContext().schemaResults[dataType],

  useSchemaLookup: () =>
    useShallowMemo(
      Object.fromEntries(
        Object.entries(useDataModelsMetadataContext().schemaResults).map(([dataType, result]) => [
          dataType,
          result.lookupTool,
        ]),
      ),
    ),

  useLookupBinding: () => {
    // Using a static selector to avoid re-rendering. While the state can update later, we don't need
    // to re-run data model validations, etc.
    const { schemaResults } = useDataModelsMetadataContext();
    return useMemo(
      () => (reference: IDataModelReference) =>
        schemaResults[reference.dataType].lookupTool.getSchemaForPath(reference.field),
      [schemaResults],
    );
  },

  useExpressionValidationConfig: (dataType: string) =>
    useDataModelsMetadataContext().expressionValidationConfigs[dataType],

  useDefaultDataElementId: () => useInitialDataContext().defaultDataElementId,

  useDataElementIdForDataType: (dataType: string) =>
    useInitialDataContext().dataElements.find((de) => de.dataType === dataType)?.id,

  useGetDataElementIdForDataType: () => {
    const dataElements = useInitialDataContext().dataElements;
    return useCallback((dataType: string) => dataElements.find((de) => de.dataType === dataType)?.id, [dataElements]);
  },

  useDataElementIds: () =>
    useShallowMemo(
      select(
        { allCtx: useAllDataModelsContext(), initialDataCtx: useInitialDataContext() },
        ({ allCtx, initialDataCtx }) =>
          Object.fromEntries(allCtx.allDataTypeIds.map((dt, i) => [dt, initialDataCtx.dataElementIds[i]])),
      ),
    ),
};
