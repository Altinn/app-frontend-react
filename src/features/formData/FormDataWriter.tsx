/* eslint-disable no-console */
import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { useMutation } from '@tanstack/react-query';
import dot from 'dot-object';
import deepEqual from 'fast-deep-equal';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { createContext } from 'src/core/contexts/context';
import { diffModels } from 'src/features/formData/diffModels';
import { FormDataReadOnlyProvider } from 'src/features/formData/FormDataReadOnly';
import { useFormDataStateMachine } from 'src/features/formData/StateMachine';
import { useMemoDeepEqual } from 'src/hooks/useMemoDeepEqual';
import type { IFormData } from 'src/features/formData/index';
import type { FDAction, FormDataStorage } from 'src/features/formData/StateMachine';
import type { IDataModelBindings } from 'src/layout/layout';

export type FDValue = string | number | boolean | object | undefined | null | FDValue[];
export type FDFreshness = 'current' | 'debounced';

interface FormDataStorageExtended extends FormDataStorage {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  hasUnsavedDebouncedChanges: boolean;
  methods: {
    setLeafValue: (path: string, newValue: any) => void;
    appendToListUnique: (path: string, newValue: any) => void;
    removeIndexFromList: (path: string, index: number) => void;
    removeValueFromList: (path: string, item: any) => void;
  };

  currentDataFlat: IFormData;
  debouncedCurrentDataFlat: IFormData;
  lastSavedDataFlat: IFormData;
}

interface MutationArg {
  newData: object;
  diff: Record<string, any>;
}

const { Provider, useCtx } = createContext<FormDataStorageExtended>({
  name: 'FormDataWriter',
  required: true,
});

function createFormDataRequestFromDiff(modelToSave: object, diff: object) {
  const data = new FormData();
  data.append('dataModel', JSON.stringify(modelToSave));
  data.append('previousValues', JSON.stringify(diff));
  return data;
}

const useFormDataSaveMutation = (uuid: string, dispatch: React.Dispatch<FDAction>) => {
  const { doPutFormData } = useAppMutations();

  return useMutation({
    mutationKey: ['saveFormData'],
    mutationFn: async (arg: MutationArg) => {
      const { newData, diff } = arg;
      const data = createFormDataRequestFromDiff(newData, diff);

      try {
        const metaData: any = await doPutFormData.call(uuid, data);
        dispatch({
          type: 'saveFinished',
          savedData: newData,
          changedFields: metaData?.changedFields,
        });
      } catch (error) {
        if (error.response && error.response.status === 303) {
          // 303 means that data has been changed by calculation on server. Try to update from response.
          // Newer backends might not reply back with this special response code when there are changes, they
          // will just respond with the 'changedFields' property instead (see code handling this above).
          if (error.response.data?.changedFields) {
            dispatch({
              type: 'saveFinished',
              savedData: newData,
              changedFields: error.response.data.changedFields,
            });
          } else {
            // No changedFields property returned, try to fetch
            // TODO: Implement
            console.log('debug, no changedFields returned, will re-fetch');
          }
        } else {
          // TODO: Store this error and warn the user when something goes wrong (or just ignore it and try again?)
          throw error;
        }
      }
    },
  });
};

interface FormDataWriterProps extends PropsWithChildren {
  uuid: string;
  initialData: object;
}

export function FormDataWriteProvider({ uuid, initialData, children }: FormDataWriterProps) {
  const [state, dispatch] = useFormDataStateMachine(uuid, initialData);
  const { mutate, isLoading: isSaving } = useFormDataSaveMutation(uuid, dispatch);

  const hasUnsavedChanges =
    state.currentData !== state.lastSavedData && !deepEqual(state.currentData, state.lastSavedData);
  const hasUnsavedDebouncedChanges =
    state.debouncedCurrentData !== state.lastSavedData && !deepEqual(state.debouncedCurrentData, state.lastSavedData);

  useEffect(() => {
    if (hasUnsavedDebouncedChanges && !isSaving) {
      const debouncedCurrentDataFlat = dot.dot(state.debouncedCurrentData);
      const lastSavedDataFlat = dot.dot(state.lastSavedData);
      const diff = diffModels(debouncedCurrentDataFlat, lastSavedDataFlat);

      if (!Object.keys(diff).length) {
        return;
      }

      mutate({
        newData: state.debouncedCurrentData,
        diff,
      });
    }
  }, [mutate, hasUnsavedDebouncedChanges, state.debouncedCurrentData, isSaving, state.lastSavedData]);

  return (
    <Provider
      value={{
        hasUnsavedChanges,
        hasUnsavedDebouncedChanges,
        isSaving,

        currentDataFlat: dot.dot(state.currentData),
        debouncedCurrentDataFlat: dot.dot(state.debouncedCurrentData),
        lastSavedDataFlat: dot.dot(state.lastSavedData),

        methods: {
          setLeafValue: (path, newValue) => dispatch({ type: 'setLeafValue', path, newValue }),
          appendToListUnique: (path, newValue) => dispatch({ type: 'appendToListUnique', path, newValue }),
          removeIndexFromList: (path, index) => dispatch({ type: 'removeIndexFromList', path, index }),
          removeValueFromList: (path, value) => dispatch({ type: 'removeValueFromList', path, value }),
        },
        ...state,
      }}
    >
      <FormDataReadOnlyProvider value={dot.dot(state.debouncedCurrentData)}>{children}</FormDataReadOnlyProvider>
    </Provider>
  );
}

function useData(freshness: FDFreshness = 'debounced') {
  const { currentData, debouncedCurrentData } = useCtx();
  return freshness === 'current' ? currentData : debouncedCurrentData;
}

const staticEmptyObject: IFormData = {};

export const FD = {
  /**
   * This will return the form data as a dot map, where the keys are dot-separated paths. This is the same format
   * as the older form data. Consider using any of the newer methods instead, which may come with performance benefits.
   */
  useAsDotMap(freshness: FDFreshness = 'debounced'): IFormData {
    const { currentDataFlat, debouncedCurrentDataFlat } = useCtx();
    return freshness === 'current' ? currentDataFlat : debouncedCurrentDataFlat;
  },

  /**
   * PRIORITY: Remove this and use useAsDotMap() instead
   */
  useDummyDotMap: (_freshness: FDFreshness = 'debounced'): IFormData => staticEmptyObject,

  /**
   * This will return the form data as a deep object, just like the server sends it to us (and the way we send it back).
   */
  useAsObject: (freshness: FDFreshness = 'debounced') => useData(freshness),

  /**
   * This returns a value, as picked from the form data. The value may be anything that is possible to store in the
   * data model (scalar values, arrays and objects). If the value is not found, undefined is returned. Null may
   * also be returned if the value is explicitly set to null.
   */
  usePick: (path: string | undefined, freshness?: FDFreshness): FDValue => {
    const data = useData(freshness);
    return useMemoDeepEqual(path ? dot.pick(path, data) : undefined);
  },

  /**
   * This returns multiple values, as picked from the form data. The values in the input object is expected to be
   * dot-separated paths, and the return value will be an object with the same keys, but with the values picked
   * from the form data. If a value is not found, undefined is returned. Null may also be returned if the value
   * is explicitly set to null.
   */
  useBindings: <T extends IDataModelBindings | undefined>(
    bindings: T,
    freshness?: FDFreshness,
  ): T extends undefined ? Record<string, never> : { [key in keyof T]: FDValue } => {
    const data = useData(freshness);
    const out: any = {};
    if (bindings) {
      for (const key of Object.keys(bindings)) {
        out[key] = dot.pick(bindings[key], data);
      }
    }

    return useMemoDeepEqual(out);
  },

  /**
   * These methods can be used to update the data model.
   */
  useMethods: () => {
    const { methods } = useCtx();
    return methods;
  },
};
