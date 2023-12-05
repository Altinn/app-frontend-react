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
import type { IFormDataFunctionality, IFormDataMethods } from 'src/features/formData/types';

interface FormDataStorageExtended extends FormDataStorage {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  hasUnsavedDebouncedChanges: boolean;
  methods: IFormDataMethods;

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
        currentData: state.currentData,
        currentDataFlat: dot.dot(state.currentData),
        debouncedCurrentData: state.debouncedCurrentData,
        currentUuid: uuid,
        debouncedCurrentDataFlat: dot.dot(state.debouncedCurrentData),
        lastSavedData: state.lastSavedData,
        lastSavedDataFlat: dot.dot(state.lastSavedData),
        methods: {
          setLeafValue: (path, newValue) => dispatch({ type: 'setLeafValue', path, newValue }),
          appendToListUnique: (path, newValue) => dispatch({ type: 'appendToListUnique', path, newValue }),
          removeIndexFromList: (path, index) => dispatch({ type: 'removeIndexFromList', path, index }),
          removeValueFromList: (path, value) => dispatch({ type: 'removeValueFromList', path, value }),
        },
      }}
    >
      <FormDataReadOnlyProvider value={dot.dot(state.debouncedCurrentData)}>{children}</FormDataReadOnlyProvider>
    </Provider>
  );
}

function useCurrentData(freshness: 'current' | 'debounced' = 'debounced') {
  const { currentData, debouncedCurrentData } = useCtx();
  return freshness === 'current' ? currentData : debouncedCurrentData;
}

export const FD: IFormDataFunctionality = {
  useAsDotMap(freshness = 'debounced') {
    const { currentDataFlat, debouncedCurrentDataFlat } = useCtx();
    return freshness === 'current' ? currentDataFlat : debouncedCurrentDataFlat;
  },
  useAsObject: (freshness = 'debounced') => useCurrentData(freshness),
  usePick: (path, freshness) => {
    const data = useCurrentData(freshness);
    return useMemoDeepEqual(path ? dot.pick(path, data) : undefined);
  },
  useBindings: (bindings, freshness) => {
    const data = useCurrentData(freshness);
    const out: any = {};
    if (bindings) {
      for (const key of Object.keys(bindings)) {
        out[key] = dot.pick(bindings[key], data);
      }
    }

    return useMemoDeepEqual(out);
  },
  useMethods: () => {
    const { methods } = useCtx();
    return methods;
  },
};
