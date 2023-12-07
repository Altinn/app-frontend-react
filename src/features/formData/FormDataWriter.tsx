/* eslint-disable no-console */
import React, { useCallback, useEffect, useMemo } from 'react';
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
import type { SaveWhileTyping } from 'src/layout/common.generated';
import type { IDataModelBindings } from 'src/layout/layout';

export type FDValue = string | number | boolean | object | undefined | null | FDValue[];
export type FDFreshness = 'current' | 'debounced';

interface Methods {
  setLeafValue: (path: string, newValue: any) => void;
  appendToListUnique: (path: string, newValue: any) => void;
  removeIndexFromList: (path: string, index: number) => void;
  removeValueFromList: (path: string, item: any) => void;
}

type SetLeafValueForBindings<B extends IDataModelBindings> = (key: keyof Exclude<B, undefined>, newValue: any) => void;

interface FormDataStorageExtended extends FormDataStorage {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  hasUnsavedDebouncedChanges: boolean;
  methods: Methods;
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

  const setLeafValue = useCallback(
    (path: string, newValue: any) => dispatch({ type: 'setLeafValue', path, newValue }),
    [dispatch],
  );
  const appendToListUnique = useCallback(
    (path: string, newValue: any) => dispatch({ type: 'appendToListUnique', path, newValue }),
    [dispatch],
  );
  const removeIndexFromList = useCallback(
    (path: string, index: number) => dispatch({ type: 'removeIndexFromList', path, index }),
    [dispatch],
  );
  const removeValueFromList = useCallback(
    (path: string, value: any) => dispatch({ type: 'removeValueFromList', path, value }),
    [dispatch],
  );

  return (
    <Provider
      value={{
        hasUnsavedChanges,
        hasUnsavedDebouncedChanges,
        isSaving,

        methods: {
          setLeafValue,
          appendToListUnique,
          removeIndexFromList,
          removeValueFromList,
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

export const FD = {
  /**
   * This will return the form data as a dot map, where the keys are dot-separated paths. This is the same format
   * as the older form data. Consider using any of the newer methods instead, which may come with performance benefits.
   * This will always give you the debounced (late) data, which may or may not be saved to the backend yet.
   */
  useDebouncedDotMap(): IFormData {
    const { debouncedCurrentData } = useCtx();
    return useMemo(() => dot.dot(debouncedCurrentData), [debouncedCurrentData]);
  },

  /**
   * This will return the form data as a deep object, just like the server sends it to us (and the way we send it back).
   */
  useAsObject: (freshness: FDFreshness = 'debounced') => useData(freshness),

  /**
   * This returns a single value, as picked from the form data. The data is converted to a string, if possible.
   * If the path points to a complex data type, like an object or array, undefined is returned.
   */
  usePickString: (path: string | undefined, freshness?: FDFreshness): string | undefined => {
    const data = useData(freshness);
    const value = path ? dot.pick(path, data) : undefined;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }

    return undefined;
  },

  /**
   * This is like the one above, but for multiple values. The values in the input object is expected to be
   * dot-separated paths, and the return value will be an object with the same keys, but with the values picked
   * from the form data.
   */
  usePickStrings: <B extends IDataModelBindings>(
    bindings: B,
    freshness?: FDFreshness,
  ): B extends undefined ? Record<string, never> : { [key in keyof B]: string | undefined } => {
    const data = useData(freshness);
    const out: any = {};
    if (bindings) {
      for (const key of Object.keys(bindings)) {
        const value = dot.pick((bindings as any)[key], data);
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          out[key] = value.toString();
        }
      }
    }

    return out;
  },

  /**
   * This returns a value, as picked from the form data. It may also return an array, object or null.
   * If you only expect a string/leaf value, use usePickString() instead.
   */
  usePickAny: (path: string | undefined, freshness?: FDFreshness): FDValue => {
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
   * This returns the raw method for setting a value in the form data. This is useful if you want to
   * set a value in the form data.
   */
  useSetLeafValue: () => {
    const { methods } = useCtx();
    return methods.setLeafValue;
  },

  /**
   * Use this hook to get a function you can use to set a single value in the form data, using a binding.
   */
  useSetForBinding: (binding: string | undefined, saveWhileTyping?: SaveWhileTyping) => {
    const { methods } = useCtx();

    return useCallback(
      (newValue: any) => {
        if (!binding) {
          window.logWarn(`No data model binding found for ${binding}, silently ignoring request to save ${newValue}`);
          return;
        }
        methods.setLeafValue(binding, newValue);
      },
      [binding, methods],
    );
  },

  /**
   * Use this hook to get a function you can use to set multiple values in the form data, using a data model bindings
   * object.
   */
  useSetForBindings: <B extends IDataModelBindings>(
    bindings: B,
    saveWhileTyping?: SaveWhileTyping,
  ): SetLeafValueForBindings<B> => {
    const { methods } = useCtx();

    return useCallback(
      (key: keyof B, newValue: any) => {
        const binding = (bindings as any)[key];
        if (!binding) {
          const keyAsString = key as string;
          window.logWarn(
            `No data model binding found for ${keyAsString}, silently ignoring request to save ${newValue}`,
          );
          return;
        }
        methods.setLeafValue(binding, newValue);
      },
      [bindings, methods],
    );
  },

  /**
   * Returns a function to append a value to a list. It checks if the value is already in the list, and if not,
   * it will append it. If the value is already in the list, it will not be appended.
   */
  useAppendToListUnique: () => {
    const { methods } = useCtx();
    return methods.appendToListUnique;
  },

  /**
   * Returns a function to remove a value from a list, by index. You should try to avoid using this, as it might
   * not do what you want if it is triggered at a moment where your copy of the form data is outdated. Calling this
   * function twice in a row for index 0 will remove the first item in the list, even if the list has changed in
   * the meantime.
   */
  useRemoveIndexFromList: () => {
    const { methods } = useCtx();
    return methods.removeIndexFromList;
  },

  /**
   * Returns a function to remove a value from a list, by value. If your list contains unique values, this is the
   * safer alternative to useRemoveIndexFromList().
   */
  useRemoveValueFromList: () => {
    const { methods } = useCtx();
    return methods.removeValueFromList;
  },
};
