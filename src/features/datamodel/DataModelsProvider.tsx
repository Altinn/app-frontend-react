import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';
import type { JSONSchema7 } from 'json-schema';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { Loader } from 'src/core/loading/Loader';
import { useCustomValidationConfigQuery } from 'src/features/customValidation/CustomValidationContext';
import { useDataModelSchemaQuery } from 'src/features/datamodel/DataModelSchemaProvider';
import { useCurrentDataModelName, useDataModelUrl } from 'src/features/datamodel/useBindingSchema';
import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { isDataModelReference } from 'src/utils/databindings';
import type { SchemaLookupTool } from 'src/features/datamodel/DataModelSchemaProvider';
import type { IExpressionValidations } from 'src/features/validation';

interface DataModelsContext {
  dataTypes: string[] | null;
  initialData: { [dataType: string]: object };
  schemas: { [dataType: string]: JSONSchema7 };
  schemaLookup: { [dataType: string]: SchemaLookupTool };
  expressionValidationConfigs: { [dataType: string]: IExpressionValidations | null };

  setDataTypes: (dataTypes: string[]) => void;
  setInitialData: (dataType: string, initialData: object) => void;
  setDataModelSchema: (dataType: string, schema: JSONSchema7, lookupTool: SchemaLookupTool) => void;
  setExpressionValidationConfig: (dataType: string, config: IExpressionValidations | null) => void;
}

function initialCreateStore() {
  return createStore<DataModelsContext>((set) => ({
    dataTypes: null,
    initialData: {},
    schemas: {},
    schemaLookup: {},
    expressionValidationConfigs: {},

    setDataTypes: (dataTypes) => {
      set((state) => {
        state.dataTypes = dataTypes;
        return state;
      });
    },
    setInitialData: (dataType, initialData) => {
      set((state) => {
        state.initialData[dataType] = initialData;
        return state;
      });
    },
    setDataModelSchema: (dataType, schema, lookupTool) => {
      set((state) => {
        state.schemas[dataType] = schema;
        state.schemaLookup[dataType] = lookupTool;
        return state;
      });
    },
    setExpressionValidationConfig: (dataType, config) => {
      set((state) => {
        state.expressionValidationConfigs[dataType] = config;
        return state;
      });
    },
  }));
}

const { Provider, useSelector } = createZustandContext({
  name: 'DataModels',
  required: true,
  initialCreateStore,
});

export function DataModelsProvider({ children }: PropsWithChildren) {
  const setDataTypes = useSelector((state) => state.setDataTypes);
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

    setDataTypes([...dataTypes]);
  }, [defaultDataType, layouts, setDataTypes]);

  return (
    <Provider>
      {dataTypes?.map((dataType) => {
        <React.Fragment key={dataType}>
          <LoadInitialData dataType={dataType} />
          <LoadSchema dataType={dataType} />
          <LoadExpressionValidationConfig dataType={dataType} />
        </React.Fragment>;
      })}
      <BlockUntilLoaded>{children}</BlockUntilLoaded>
    </Provider>
  );
}

function BlockUntilLoaded({ children }: PropsWithChildren) {
  const { dataTypes, initialData, schemas, expressionValidationConfigs } = useSelector((state) => state);
  if (!dataTypes) {
    return <Loader reason='data-types' />;
  }

  for (const dataType of dataTypes) {
    if (!Object.keys(initialData).includes(dataType)) {
      return <Loader reason='initial-data' />;
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
  const url = useDataModelUrl(true, dataType);
  const { data } = useFormDataQuery(url);

  useEffect(() => {
    if (data) {
      setInitialData(dataType, data);
    }
  }, [data, dataType, setInitialData]);

  return null;
}

function LoadSchema({ dataType }: LoaderProps) {
  const setDataModelSchema = useSelector((state) => state.setDataModelSchema);
  const { data } = useDataModelSchemaQuery(dataType);

  useEffect(() => {
    if (data) {
      setDataModelSchema(dataType, data.schema, data.lookupTool);
    }
  }, [data, dataType, setDataModelSchema]);

  return null;
}

function LoadExpressionValidationConfig({ dataType }: LoaderProps) {
  const setExpressionValidationConfig = useSelector((state) => state.setExpressionValidationConfig);
  const { data } = useCustomValidationConfigQuery(dataType);

  useEffect(() => {
    if (data) {
      setExpressionValidationConfig(dataType, data);
    }
  }, [data, dataType, setExpressionValidationConfig]);

  return null;
}
