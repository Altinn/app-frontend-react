import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import dot from 'dot-object';

import { ContextNotProvided, createContext } from 'src/core/contexts/context';
import { useDataTypeByLayoutSetId } from 'src/features/applicationMetadata/appMetadataUtils';
import { useAvailableDataModels } from 'src/features/datamodel/useAvailableDataModels';
import { useDataModelUrl } from 'src/features/datamodel/useBindingSchema';
import { useCurrentLayoutSetId } from 'src/features/form/layoutSets/useCurrentLayoutSetId';
import { FD } from 'src/features/formData/FormDataWrite';
import { DataModelReader, DataModelReaders } from 'src/features/formData/index';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useAsRef } from 'src/hooks/useAsRef';

interface Context {
  readers: DataModelReaders<DMReader>;
  toFetch: string[];
  setToFetch: React.Dispatch<React.SetStateAction<string[]>>;
}

const { Provider, useLaxCtx, useCtx } = createContext<Context>({
  name: 'FormDataReaders',
  required: true,
});

class DMReader extends DataModelReader {
  protected model: object | undefined;

  constructor(model: object | undefined) {
    super();
    this.model = model;
  }

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

  isLoaded(): boolean {
    return typeof this.model !== 'undefined';
  }

  setModel(model: object | undefined) {
    this.model = model;
  }
}

type AccessingCallback = (dataModelName: string) => void;

export class DMReaders extends DataModelReaders<DMReader> {
  protected readers: { [name: string]: DMReader } = {};
  protected onAccessingNewDataModel?: AccessingCallback;

  constructor() {
    super();
  }

  getReader(dataModelName: string): DMReader {
    if (!this.readers[dataModelName]) {
      this.readers[dataModelName] = new DMReader(undefined);
      if (this.onAccessingNewDataModel) {
        this.onAccessingNewDataModel(dataModelName);
      }
    }
    return this.readers[dataModelName];
  }

  setOnAccessingNewDataModel(callback: AccessingCallback) {
    this.onAccessingNewDataModel = callback;
  }
}

/**
 * This provider gives us readers for both the current data model and any others we might need to load.
 * It should only be provided through the FormContext, as it depends on the current (mutable) data model to
 * be provided. If we're not in a form, the GlobalFormDataReadersProvider should be used instead.
 */
export function FormDataReadersProvider({ children }: PropsWithChildren) {
  const layoutSetId = useCurrentLayoutSetId();
  const currentDataType = useDataTypeByLayoutSetId(layoutSetId);
  const currentModel = FD.useDebounced();
  const parentReaders = useDataModelReaders();

  useEffect(() => {
    if (!currentDataType) {
      return;
    }
    const reader = parentReaders.getReader(currentDataType);
    reader.setModel(currentModel);
  }, [currentDataType, currentModel, parentReaders]);

  return <>{children}</>;
}

/**
 * This globally available provider will fetch any data model, if possible, and provide readers for them.
 *
 */
export function GlobalFormDataReadersProvider({ children }: PropsWithChildren) {
  const availableModels = useAvailableDataModels().map((dm) => dm.id);
  const availableModelsRef = useAsRef(availableModels);
  const [modelsToFetch, setModelsToFetch] = React.useState<string[]>([]);
  const [nonAvailableModelsToFetch, setNonAvailableModelsToFetch] = React.useState<string[]>([]);

  const classRef = React.useRef<DMReaders>();
  if (!classRef.current) {
    const readers = new DMReaders();
    classRef.current = readers;
    readers.setOnAccessingNewDataModel((dataModelName) => {
      if (availableModelsRef.current.includes(dataModelName)) {
        setModelsToFetch((models) => [...models, dataModelName]);
      } else {
        setNonAvailableModelsToFetch((models) => [...models, dataModelName]);
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

  // TODO: Generate good error messages for missing data models

  return (
    <Provider
      value={{
        readers: classRef.current!,
        toFetch: modelsToFetch,
        setToFetch: setModelsToFetch,
      }}
    >
      {children}
    </Provider>
  );
}

export function DataModelFetcher() {
  const ctx = useLaxCtx();
  if (ctx == ContextNotProvided) {
    return null;
  }

  // TODO: Make sure default is named and fetched from FD

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

function SpecificDataModelFetcher({ dataModelName, reader }: { dataModelName: string; reader: DMReader }) {
  const url = useDataModelUrl(dataModelName);
  const { data } = useFormDataQuery(url);
  const { setToFetch } = useCtx();

  useEffect(() => {
    if (data) {
      reader.setModel(data);
      setToFetch((models) => models.filter((model) => model !== dataModelName));
    }
  }, [data, dataModelName, reader, setToFetch]);

  return null;
}

const defaultReaders = new DMReaders();
export const useDataModelReaders = () => {
  const ctx = useLaxCtx();
  if (ctx === ContextNotProvided) {
    return defaultReaders;
  }

  return ctx.readers;
};
