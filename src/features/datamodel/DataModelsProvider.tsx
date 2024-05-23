import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';
import type { JSONSchema7 } from 'json-schema';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { getFirstDataElementId } from 'src/features/applicationMetadata/appMetadataUtils';
import { useCustomValidationConfigQuery } from 'src/features/customValidation/useCustomValidationQuery';
import { useCurrentDataModelName, useDataModelUrl } from 'src/features/datamodel/useBindingSchema';
import { useDataModelSchemaQuery } from 'src/features/datamodel/useDataModelSchemaQuery';
import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { InvalidDataTypeException } from 'src/features/formData/InvalidDataTypeException';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';
import { MissingRolesError } from 'src/features/instantiate/containers/MissingRolesError';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useBackendValidationQuery } from 'src/features/validation/backendValidation/backendValidationQuery';
import { TaskKeys } from 'src/hooks/useNavigatePage';
import { isDataModelReference } from 'src/utils/databindings';
import { isAxiosError } from 'src/utils/isAxiosError';
import { HttpStatusCodes } from 'src/utils/network/networking';
import { getUrlWithLanguage } from 'src/utils/urls/urlHelper';
import type { SchemaLookupTool } from 'src/features/datamodel/useDataModelSchemaQuery';
import type { BackendValidatorGroups, IExpressionValidations } from 'src/features/validation';

interface DataModelsState {
  defaultDataType: string | undefined;
  dataTypes: string[] | null;
  initialData: { [dataType: string]: object };
  urls: { [dataType: string]: string };
  dataElementIds: { [dataType: string]: string | null };
  initialValidations: { [dataType: string]: BackendValidatorGroups };
  schemas: { [dataType: string]: JSONSchema7 };
  schemaLookup: { [dataType: string]: SchemaLookupTool };
  expressionValidationConfigs: { [dataType: string]: IExpressionValidations | null };
  error: Error | null;
}

interface DataModelsMethods {
  setDataTypes: (dataTypes: string[], defaultDataType: string | undefined) => void;
  setInitialData: (dataType: string, initialData: object, url: string, dataElementId: string | null) => void;
  setInitialValidations: (dataType: string, initialValidations: BackendValidatorGroups) => void;
  setDataModelSchema: (dataType: string, schema: JSONSchema7, lookupTool: SchemaLookupTool) => void;
  setExpressionValidationConfig: (dataType: string, config: IExpressionValidations | null) => void;
  setError: (error: Error) => void;
}

function initialCreateStore() {
  return createStore<DataModelsState & DataModelsMethods>()((set) => ({
    defaultDataType: undefined,
    dataTypes: null,
    initialData: {},
    urls: {},
    dataElementIds: {},
    initialValidations: {},
    schemas: {},
    schemaLookup: {},
    expressionValidationConfigs: {},
    error: null,

    setDataTypes: (dataTypes, defaultDataType) => {
      set(() => ({ dataTypes, defaultDataType }));
    },
    setInitialData: (dataType, initialData, url, dataElementId) => {
      set((state) => ({
        initialData: {
          ...state.initialData,
          [dataType]: initialData,
        },
        urls: {
          ...state.urls,
          [dataType]: url,
        },
        dataElementIds: {
          ...state.dataElementIds,
          [dataType]: dataElementId,
        },
      }));
    },
    setInitialValidations: (dataType, initialValidations) => {
      set((state) => ({
        initialValidations: {
          ...state.initialValidations,
          [dataType]: initialValidations,
        },
      }));
    },
    setDataModelSchema: (dataType, schema, lookupTool) => {
      set((state) => ({
        schemas: {
          ...state.schemas,
          [dataType]: schema,
        },
        schemaLookup: {
          ...state.schemaLookup,
          [dataType]: lookupTool,
        },
      }));
    },
    setExpressionValidationConfig: (dataType, config) => {
      set((state) => ({
        expressionValidationConfigs: {
          ...state.expressionValidationConfigs,
          [dataType]: config,
        },
      }));
    },
    setError(error: Error) {
      set((state) => {
        // Only set the first error, no need to overwrite if additional errors occur
        if (!state.error) {
          return { error };
        }
        return {};
      });
    },
  }));
}

const { Provider, useSelector, useLaxSelector } = createZustandContext({
  name: 'DataModels',
  required: true,
  initialCreateStore,
});

export function DataModelsProvider({ children }: PropsWithChildren) {
  return (
    <Provider>
      <DataModelsLoader />
      <BlockUntilLoaded>{children}</BlockUntilLoaded>
    </Provider>
  );
}

function DataModelsLoader() {
  const applicationMetadata = useApplicationMetadata();
  const setDataTypes = useSelector((state) => state.setDataTypes);
  const setError = useSelector((state) => state.setError);
  const dataTypes = useSelector((state) => state.dataTypes);
  const layouts = useLayouts();
  const defaultDataType = useCurrentDataModelName();

  // Find all data types referenced in dataModelBindings in the layout
  useEffect(() => {
    const dataTypes = new Set<string>();

    if (defaultDataType) {
      dataTypes.add(defaultDataType);
    }

    for (const layout of Object.values(layouts)) {
      for (const component of layout ?? []) {
        if ('dataModelBindings' in component && component.dataModelBindings) {
          for (const binding of Object.values(component.dataModelBindings)) {
            if (isDataModelReference(binding)) {
              dataTypes.add(binding.dataType);
            }
          }
        }
      }
    }

    // Verify that referenced data types are defined in application metadata, and have a classRef
    for (const dataType of dataTypes) {
      if (!applicationMetadata.dataTypes.find((dt) => dt.id === dataType && dt.appLogic?.classRef)) {
        const error = new InvalidDataTypeException(dataType);
        window.logErrorOnce(error.message);
        setError(error);
        return;
      }
    }

    setDataTypes([...dataTypes], defaultDataType);
  }, [applicationMetadata.dataTypes, defaultDataType, layouts, setDataTypes, setError]);

  return (
    <>
      {dataTypes?.map((dataType) => (
        <React.Fragment key={dataType}>
          <LoadInitialData dataType={dataType} />
          <LoadInitialValidations dataType={dataType} />
          <LoadSchema dataType={dataType} />
          <LoadExpressionValidationConfig dataType={dataType} />
        </React.Fragment>
      ))}
    </>
  );
}

function BlockUntilLoaded({ children }: PropsWithChildren) {
  const { dataTypes, initialData, initialValidations, schemas, expressionValidationConfigs, error } = useSelector(
    (state) => state,
  );

  if (error) {
    // Error trying to fetch data, if missing rights we display relevant page
    if (isAxiosError(error) && error.response?.status === HttpStatusCodes.Forbidden) {
      return <MissingRolesError />;
    }

    return <DisplayError error={error} />;
  }

  if (!dataTypes) {
    return <Loader reason='data-types' />;
  }

  for (const dataType of dataTypes) {
    if (!Object.keys(initialData).includes(dataType)) {
      return <Loader reason='initial-data' />;
    }

    if (!Object.keys(initialValidations).includes(dataType)) {
      return <Loader reason='initial-validations' />;
    }

    if (!Object.keys(schemas).includes(dataType)) {
      return <Loader reason='data-model-schema' />;
    }

    if (!Object.keys(expressionValidationConfigs).includes(dataType)) {
      return <Loader reason='expression-validation-config' />;
    }
  }

  return <>{children}</>;
}

interface LoaderProps {
  dataType: string;
}

function LoadInitialData({ dataType }: LoaderProps) {
  const setInitialData = useSelector((state) => state.setInitialData);
  const setError = useSelector((state) => state.setError);
  const url = useDataModelUrl(true, dataType);
  const instance = useLaxInstanceData();
  const dataElementId = (instance && getFirstDataElementId(instance, dataType)) ?? null;
  const { data, error } = useFormDataQuery(getUrlWithLanguage(url, useCurrentLanguage()));

  useEffect(() => {
    if (data && url) {
      setInitialData(dataType, data, url, dataElementId);
    }
  }, [data, dataElementId, dataType, setInitialData, url]);

  useEffect(() => {
    error && setError(error);
  }, [error, setError]);

  return null;
}

function LoadInitialValidations({ dataType }: LoaderProps) {
  const setInitialValidations = useSelector((state) => state.setInitialValidations);
  const setError = useSelector((state) => state.setError);
  const isCustomReceipt = useProcessTaskId() === TaskKeys.CustomReceipt;
  const { data, error } = useBackendValidationQuery(dataType, !isCustomReceipt);

  useEffect(() => {
    if (isCustomReceipt) {
      setInitialValidations(dataType, {});
    } else if (data) {
      setInitialValidations(dataType, data);
    }
  }, [data, dataType, isCustomReceipt, setInitialValidations]);

  useEffect(() => {
    error && setError(error);
  }, [error, setError]);

  return null;
}

function LoadSchema({ dataType }: LoaderProps) {
  const setDataModelSchema = useSelector((state) => state.setDataModelSchema);
  const setError = useSelector((state) => state.setError);
  const { data, error } = useDataModelSchemaQuery(dataType);

  useEffect(() => {
    if (data) {
      setDataModelSchema(dataType, data.schema, data.lookupTool);
    }
  }, [data, dataType, setDataModelSchema]);

  useEffect(() => {
    error && setError(error);
  }, [error, setError]);

  return null;
}

function LoadExpressionValidationConfig({ dataType }: LoaderProps) {
  const setExpressionValidationConfig = useSelector((state) => state.setExpressionValidationConfig);
  const setError = useSelector((state) => state.setError);
  const { data, isSuccess, error } = useCustomValidationConfigQuery(dataType);

  useEffect(() => {
    if (isSuccess) {
      setExpressionValidationConfig(dataType, data);
    }
  }, [data, dataType, isSuccess, setExpressionValidationConfig]);

  useEffect(() => {
    error && setError(error);
  }, [error, setError]);

  return null;
}

export const DataModels = {
  useFullState: () => useSelector((state) => state),

  useLaxDefaultDataType: () => useLaxSelector((state) => state.defaultDataType),

  useLaxWritableDataTypes: () => useLaxSelector((state) => state.dataTypes!),

  useWritableDataTypes: () => useSelector((state) => state.dataTypes!),

  useInitialValidations: (dataType: string) => useSelector((state) => state.initialValidations[dataType]),

  useDataModelSchema: (dataType: string) => useSelector((state) => state.schemas[dataType]),

  useDataModelSchemaLookupTool: (dataType: string) => useSelector((state) => state.schemaLookup[dataType]),

  useExpressionValidationConfig: (dataType: string) =>
    useSelector((state) => state.expressionValidationConfigs[dataType]),
};
