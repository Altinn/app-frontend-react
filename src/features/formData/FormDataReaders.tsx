import React, { useCallback, useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import dot from 'dot-object';

import { ContextNotProvided, createContext } from 'src/core/contexts/context';
import { useDataTypeByLayoutSetId } from 'src/features/applicationMetadata/appMetadataUtils';
import { useAvailableDataModels } from 'src/features/datamodel/useAvailableDataModels';
import { useDataModelUrl } from 'src/features/datamodel/useBindingSchema';
import { useCurrentLayoutSetId } from 'src/features/form/layoutSets/useCurrentLayoutSetId';
import { FD } from 'src/features/formData/FormDataWrite';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useAsRef } from 'src/hooks/useAsRef';
import { useNavigationParams } from 'src/hooks/useNavigatePage';

interface Context {
  readers: DataModelReaders;
  toFetch: string[];
  setToFetch: React.Dispatch<React.SetStateAction<string[]>>;
  default: DataModelReader | undefined;
  setDefault: (reader: DataModelReader) => void;
  reset: () => void;
}

const { Provider, useLaxCtx, useCtx } = createContext<Context>({
  name: 'FormDataReaders',
  required: true,
});

class DataModelReader {
  protected model: object | undefined;
  protected status: 'loading' | 'loaded' | 'error' = 'loading';

  constructor(protected name: string) {}

  getAsString(path: string): string | undefined {
    if (!this.model) {
      return undefined;
    }
    const realValue = dot.pick(path, this.model);
    if (typeof realValue === 'string' || typeof realValue === 'number' || typeof realValue === 'boolean') {
      return realValue.toString();
    }
    return undefined;
  }

  getName(): string {
    return this.name;
  }

  isLoading(): boolean {
    return this.status === 'loading';
  }

  setModel(model: object | undefined) {
    this.model = model;
    this.status = 'loaded';
  }

  setError() {
    this.status = 'error';
  }
}

type AccessingCallback = (dataModel: DataModelReader) => void;

export class DataModelReaders {
  protected readers: { [name: string]: DataModelReader } = {};
  protected onAccessingNewDataModel?: AccessingCallback;

  getReader(dataModelName: string): DataModelReader {
    if (dataModelName === 'default') {
      throw new Error('The default data model is not available here, use the value from the context instead.');
    }

    if (!this.readers[dataModelName]) {
      const reader = new DataModelReader(dataModelName);
      this.readers[dataModelName] = reader;
      if (this.onAccessingNewDataModel) {
        this.onAccessingNewDataModel(reader);
      }
    }
    return this.readers[dataModelName];
  }

  setOnAccessingNewDataModel(callback: AccessingCallback) {
    this.onAccessingNewDataModel = callback;
  }

  reset() {
    this.readers = {};
  }
}

/**
 * This provider gives us readers for both the current data model and any others we might need to load.
 * It should only be provided somewhere inside a FormDataWriteProvider when rendering a form.
 */
export function FormDataReadersProvider({ children }: PropsWithChildren) {
  const layoutSetId = useCurrentLayoutSetId();
  const currentDataType = useDataTypeByLayoutSetId(layoutSetId);
  const currentModel = FD.useDebounced();
  const parent = useDataModelReaders();
  const { setDefault } = useCtx();

  useEffect(() => {
    if (!currentDataType) {
      return;
    }
    const reader = parent.readers.getReader(currentDataType);
    reader.setModel(currentModel);
    setDefault(reader);
  }, [currentDataType, currentModel, parent, setDefault]);

  return <>{children}</>;
}

/**
 * This globally available provider will fetch any data model, if possible, and provide readers for them.
 * This provider can live anywhere as long as it can get the application metadata. You also have to make sure
 * to render FormDataReadersProvider somewhere inside if rendering in a form, and render DataModelFetcher.
 */
export function GlobalFormDataReadersProvider({ children }: PropsWithChildren) {
  const availableModels = useAvailableDataModels().map((dm) => dm.id);
  const availableModelsRef = useAsRef(availableModels);
  const [modelsToFetch, setModelsToFetch] = React.useState<string[]>([]);
  const [nonAvailableModelsToFetch, setNonAvailableModelsToFetch] = React.useState<string[]>([]);
  const [defaultReader, setDefaultReader] = React.useState<DataModelReader>();

  const classRef = React.useRef<DataModelReaders>();
  if (!classRef.current) {
    const readers = new DataModelReaders();
    classRef.current = readers;
    readers.setOnAccessingNewDataModel((reader) => {
      const dataModelName = reader.getName();
      if (availableModelsRef.current.includes(dataModelName)) {
        setModelsToFetch((models) => [...models, dataModelName]);
      } else {
        setNonAvailableModelsToFetch((models) => [...models, dataModelName]);
        reader.setError();
        window.logWarnOnce(
          `One or more text resources look up variables from 'dataModel.${dataModelName}', but it was not ` +
            `found in the available data models in the application metadata.`,
        );
      }
    });
  }

  useEffect(() => {
    for (const model of nonAvailableModelsToFetch) {
      if (availableModels.includes(model)) {
        setModelsToFetch((models) => [...models, model]);
        setNonAvailableModelsToFetch((models) => models.filter((m) => m !== model));
      }
    }
  }, [availableModels, nonAvailableModelsToFetch]);

  const reset = useCallback(() => {
    classRef.current!.reset();
    setModelsToFetch([]);
    setNonAvailableModelsToFetch([]);
    setDefaultReader(undefined);
  }, []);

  return (
    <Provider
      value={{
        readers: classRef.current!,
        toFetch: modelsToFetch,
        setToFetch: setModelsToFetch,
        default: defaultReader,
        setDefault: setDefaultReader,
        reset,
      }}
    >
      {children}
    </Provider>
  );
}

/**
 * This utility will fetch any data model that is needed, and provide readers for them. Make sure to render this
 * somewhere in the tree, as early as possible, but also make sure it can read from all the providers it needs.
 */
export function DataModelFetcher() {
  const ctx = useLaxCtx();
  const { taskId } = useNavigationParams();

  // Reset the readers when the task changes
  const reset = ctx === ContextNotProvided ? undefined : ctx.reset;
  useEffect(() => {
    reset && reset();
  }, [reset, taskId]);

  if (ctx == ContextNotProvided) {
    return null;
  }

  const { toFetch, readers } = ctx;
  return (
    <>
      {toFetch.map((dataModelName) => (
        <SpecificDataModelFetcher
          key={dataModelName}
          dataModelName={dataModelName}
          reader={readers.getReader(dataModelName)}
        />
      ))}
    </>
  );
}

function SpecificDataModelFetcher({ dataModelName, reader }: { dataModelName: string; reader: DataModelReader }) {
  const url = useDataModelUrl(dataModelName);
  const { data, error } = useFormDataQuery(url);
  const { setToFetch } = useCtx();

  useEffect(() => {
    if (data) {
      reader.setModel(data);
      setToFetch((models) => models.filter((model) => model !== dataModelName));
    }
  }, [data, dataModelName, reader, setToFetch]);

  useEffect(() => {
    if (error) {
      window.logErrorOnce(
        `One or more text resources look up variables from 'dataModel.${dataModelName}', but we failed to fetch it:\n`,
        error,
      );
      reader.setError();
      setToFetch((models) => models.filter((model) => model !== dataModelName));
    }
  }, [dataModelName, error, reader, setToFetch]);

  return null;
}

const nullReaders = new DataModelReaders();
export const useDataModelReaders = (): { readers: DataModelReaders; default: DataModelReader | undefined } => {
  const ctx = useLaxCtx();
  if (ctx === ContextNotProvided) {
    return {
      readers: nullReaders,
      default: undefined,
    };
  }

  return {
    readers: ctx.readers,
    default: ctx.default,
  };
};
