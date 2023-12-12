/* eslint-disable no-console */
import React, { useCallback, useEffect, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { useMutation } from '@tanstack/react-query';
import dot from 'dot-object';
import deepEqual from 'fast-deep-equal';
import { useStore } from 'zustand';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { createContext } from 'src/core/contexts/context';
import { diffModels } from 'src/features/formData/diffModels';
import { useFormDataWriteStateMachine } from 'src/features/formData/FormDataWriteStateMachine';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useMemoDeepEqual } from 'src/hooks/useMemoDeepEqual';
import type { FormDataContext } from 'src/features/formData/FormDataWriteStateMachine';
import type { IFormData } from 'src/features/formData/index';
import type { SaveWhileTyping } from 'src/layout/common.generated';
import type { IDataModelBindings } from 'src/layout/layout';

export type FDValue = string | number | boolean | object | undefined | null | FDValue[];
export type FDFreshness = 'current' | 'debounced';

type SetLeafValueForBindings<B extends IDataModelBindings> = (key: keyof Exclude<B, undefined>, newValue: any) => void;

interface MutationArg {
  dataModelUrl: string;
  newData: object;
  diff: Record<string, any>;
}

const { Provider, useCtx } = createContext<ReturnType<typeof useFormDataWriteStateMachine>>({
  name: 'FormDataWrite',
  required: true,
});

function useSelector<U>(selector: (state: FormDataContext) => U): U {
  return useStore(useCtx(), selector);
}

function createFormDataRequestFromDiff(modelToSave: object, diff: object) {
  const data = new FormData();
  data.append('dataModel', JSON.stringify(modelToSave));
  data.append('previousValues', JSON.stringify(diff));
  return data;
}

const useFormDataSaveMutation = (ctx: FormDataContext) => {
  const { doPutFormData } = useAppMutations();
  const { saveFinished } = ctx;

  return useMutation({
    mutationKey: ['saveFormData'],
    mutationFn: async (arg: MutationArg) => {
      const { dataModelUrl, newData, diff } = arg;
      const data = createFormDataRequestFromDiff(newData, diff);
      const metaData = await doPutFormData.call(dataModelUrl, data);
      saveFinished(newData, metaData?.changedFields);
    },
  });
};

interface FormDataWriterProps extends PropsWithChildren {
  url: string;
  initialData: object;
}

export function FormDataWriteProvider({ url, initialData, children }: FormDataWriterProps) {
  const store = useFormDataWriteStateMachine(initialData);
  return (
    <Provider value={store}>
      <FormDataEffects url={url} />
      {children}
    </Provider>
  );
}

function FormDataEffects({ url }: { url: string }) {
  const state = useStore(useCtx());
  const { freeze, currentData, debouncedCurrentData, lastSavedData, debounceTimeout } = state;
  const { mutate, isLoading: isSaving } = useFormDataSaveMutation(state);
  const ruleConnections = useAppSelector((state) => state.formDynamics.ruleConnection);

  // Freeze the data model when the user stops typing. Freezing it has the effect of triggering a useEffect in
  // FormDataWriteProvider, which will save the data model to the server.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentData !== debouncedCurrentData) {
        freeze(ruleConnections);
      }
    }, debounceTimeout);

    return () => {
      clearTimeout(timer);
    };
  }, [ruleConnections, freeze, currentData, debouncedCurrentData, debounceTimeout]);

  // Save the data model when the data has been frozen to debouncedCurrentData and is different from the saved data
  useEffect(() => {
    const hasUnsavedDebouncedChanges =
      debouncedCurrentData !== lastSavedData && !deepEqual(debouncedCurrentData, lastSavedData);

    if (hasUnsavedDebouncedChanges && !isSaving) {
      const debouncedCurrentDataFlat = dot.dot(debouncedCurrentData);
      const lastSavedDataFlat = dot.dot(lastSavedData);
      const diff = diffModels(debouncedCurrentDataFlat, lastSavedDataFlat);

      if (!Object.keys(diff).length) {
        return;
      }

      console.log('debug, saving data model', debouncedCurrentData, lastSavedData);
      mutate({
        dataModelUrl: url,
        newData: debouncedCurrentData,
        diff,
      });
    }
  }, [mutate, lastSavedData, debouncedCurrentData, isSaving, url]);

  return null;
}

export const FD = {
  /**
   * This will return the form data as a dot map, where the keys are dot-separated paths. This is the same format
   * as the older form data. Consider using any of the newer methods instead, which may come with performance benefits.
   * This will always give you the debounced (late) data, which may or may not be saved to the backend yet.
   */
  useDebouncedDotMap(): IFormData {
    const debouncedCurrentData = useSelector((v) => v.debouncedCurrentData);
    return useMemo(() => dot.dot(debouncedCurrentData), [debouncedCurrentData]);
  },

  /**
   * This will return the form data as a deep object, just like the server sends it to us (and the way we send it back).
   */
  useAsObject: (freshness: FDFreshness = 'debounced') =>
    useSelector((v) => (freshness === 'current' ? v.currentData : v.debouncedCurrentData)),

  /**
   * This returns a single value, as picked from the form data. The data is always converted to a string.
   * If the path points to a complex data type, like an object or array, an empty string is returned.
   * Use this when you expect a string/leaf value, and provide that to a controlled React component
   */
  usePickFreshString: (path: string | undefined): string => {
    const value = useSelector((v) => (path ? dot.pick(path, v.currentData) : undefined));
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value.toString() : '';
  },

  /**
   * This is like the one above, but for multiple values. The values in the input object is expected to be
   * dot-separated paths, and the return value will be an object with the same keys, but with the values picked
   * from the form data.
   */
  usePickFreshStrings: <B extends IDataModelBindings>(_bindings: B): { [key in keyof B]: string } => {
    const bindings = _bindings as any;
    const currentData = useSelector((s) => s.currentData);

    return useMemo(
      () =>
        new Proxy({} as { [key in keyof B]: string }, {
          get(_, _key): any {
            const key = _key.toString();
            const binding = key in bindings && bindings[key];
            const value = binding && dot.pick(binding, currentData);
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
              return value.toString();
            }
            return '';
          },
        }),
      [bindings, currentData],
    );
  },

  /**
   * This returns a value, as picked from the form data. It may also return an array, object or null.
   * If you only expect a string/leaf value, use usePickString() instead.
   */
  usePickFreshAny: (path: string | undefined): FDValue => {
    const currentData = useSelector((s) => s.currentData);
    return useMemoDeepEqual(path ? dot.pick(path, currentData) : undefined);
  },

  /**
   * This returns multiple values, as picked from the form data. The values in the input object is expected to be
   * dot-separated paths, and the return value will be an object with the same keys, but with the values picked
   * from the form data. If a value is not found, undefined is returned. Null may also be returned if the value
   * is explicitly set to null.
   */
  useFreshBindings: <T extends IDataModelBindings | undefined>(
    bindings: T,
  ): T extends undefined ? Record<string, never> : { [key in keyof T]: FDValue } => {
    const currentData = useSelector((s) => s.currentData);
    const out: any = {};
    if (bindings) {
      for (const key of Object.keys(bindings)) {
        out[key] = dot.pick(bindings[key], currentData);
      }
    }

    return useMemoDeepEqual(out);
  },

  /**
   * This returns the raw method for setting a value in the form data. This is useful if you want to
   * set a value in the form data.
   */
  useSetLeafValue: () => useSelector((s) => s.setLeafValue),

  /**
   * Use this hook to get a function you can use to set a single value in the form data, using a binding.
   */
  useSetForBinding: (binding: string | undefined, saveWhileTyping?: SaveWhileTyping) => {
    const setLeafValue = useSelector((s) => s.setLeafValue);

    return useCallback(
      (newValue: any) => {
        if (!binding) {
          window.logWarn(`No data model binding found, silently ignoring request to save ${newValue}`);
          return;
        }
        setLeafValue({
          path: binding,
          newValue,
          debounceTimeout: typeof saveWhileTyping === 'number' ? saveWhileTyping : undefined,
        });
      },
      [binding, saveWhileTyping, setLeafValue],
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
    const setLeafValue = useSelector((s) => s.setLeafValue);

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
        setLeafValue({
          path: binding,
          newValue,
          debounceTimeout: typeof saveWhileTyping === 'number' ? saveWhileTyping : undefined,
        });
      },
      [bindings, saveWhileTyping, setLeafValue],
    );
  },

  /**
   * Returns a function to append a value to a list. It checks if the value is already in the list, and if not,
   * it will append it. If the value is already in the list, it will not be appended.
   */
  useAppendToListUnique: () => useSelector((s) => s.appendToListUnique),

  /**
   * Returns a function to remove a value from a list, by index. You should try to avoid using this, as it might
   * not do what you want if it is triggered at a moment where your copy of the form data is outdated. Calling this
   * function twice in a row for index 0 will remove the first item in the list, even if the list has changed in
   * the meantime.
   */
  useRemoveIndexFromList: () => useSelector((s) => s.removeIndexFromList),

  /**
   * Returns a function to remove a value from a list, by value. If your list contains unique values, this is the
   * safer alternative to useRemoveIndexFromList().
   */
  useRemoveValueFromList: () => useSelector((s) => s.removeValueFromList),
};
