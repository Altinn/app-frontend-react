/* eslint-disable no-console */
import React from 'react';

import { useMutation } from '@tanstack/react-query';
import dot from 'dot-object';

import { useAppMutations, useAppQueries } from 'src/contexts/appQueriesContext';
import {
  createFormDataRequestFromDiff,
  createFormDataRequestLegacy,
  diffModels,
} from 'src/features/formData/submit/submitFormDataSagas';
import { useFormDataStateMachine } from 'src/features/formData2/StateMachine';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useMemoDeepEqual } from 'src/hooks/useMemoDeepEqual';
import { getCurrentTaskDataElementId } from 'src/utils/appMetadata';
import { createStrictContext } from 'src/utils/createContext';
import type { FDAction, FormDataStorage } from 'src/features/formData2/StateMachine';
import type { IFormDataFunctionality, IFormDataMethods } from 'src/features/formData2/types';

interface FormDataStorageExtended extends FormDataStorage {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  hasUnsavedDebouncedChanges: boolean;
}

interface FormDataStorageInternal {
  dispatch: React.Dispatch<FDAction>;
}

interface FormDataStorageWithMethods extends FormDataStorageExtended {
  methods: IFormDataMethods;
}

interface MutationArg {
  newData: object;
  diff: Record<string, any>;
}

const { Provider, useCtx } = createStrictContext<FormDataStorageWithMethods>({
  name: 'FormData',
});

const useFormDataUuid = () =>
  useAppSelector((state) =>
    getCurrentTaskDataElementId({
      application: state.applicationMetadata.applicationMetadata,
      instance: state.deprecated.lastKnownInstance,
      process: state.deprecated.lastKnownProcess,
      layoutSets: state.formLayout.layoutsets,
    }),
  );

interface PerformSaveParams {
  uuid: string;
  useMultiPart: boolean | undefined;
  dispatch: React.Dispatch<FDAction>;
  doPutFormData: (uuid: string, data: FormData) => Promise<object>;
  arg: MutationArg;
}

const performSave = async ({ uuid, useMultiPart, dispatch, doPutFormData, arg }: PerformSaveParams) => {
  const { newData, diff } = arg;
  const { data } = useMultiPart ? createFormDataRequestFromDiff(newData, diff) : createFormDataRequestLegacy(newData);

  try {
    const metaData: any = await doPutFormData(uuid, data);
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
};

/**
 * PRIORITY: Update this to use all the logic in the newer src/hooks/queries/useFormDataQuery.ts, and/or add mutation
 * support to that hook.
 */
const useFormDataQuery = (): FormDataStorageExtended & FormDataStorageInternal => {
  const { fetchFormData } = useAppQueries();
  const { doPutFormData } = useAppMutations();
  const useMultiPart = useAppSelector(
    (state) => state.applicationMetadata.applicationMetadata?.features?.multiPartSave,
  );

  const [state, dispatch] = useFormDataStateMachine();
  const uuid = useFormDataUuid();
  const enabled = uuid !== undefined;

  const mutation = useMutation(async (arg?: MutationArg) => {
    if (!enabled) {
      return;
    }

    if (state.currentUuid === uuid && arg) {
      await performSave({ uuid, useMultiPart, dispatch, doPutFormData: doPutFormData.call, arg });
    } else {
      dispatch({
        type: 'initialFetch',
        data: await fetchFormData(uuid),
        uuid,
      });
    }

    throw new Error('Non-initialization mutation before initialization');
  });

  React.useEffect(() => {
    if (enabled && state.currentUuid !== uuid && !mutation.isLoading) {
      mutation.mutate(undefined);
    }
  }, [mutation, enabled, state.currentUuid, uuid]);

  const isSaving = mutation.isLoading;
  const hasUnsavedChanges = enabled && state.currentData !== state.lastSavedData;
  const hasUnsavedDebouncedChanges = enabled && state.debouncedCurrentData !== state.lastSavedData;

  React.useEffect(() => {
    if (hasUnsavedDebouncedChanges && !mutation.isLoading) {
      mutation.mutate({
        newData: state.debouncedCurrentData,
        diff: diffModels(state.debouncedCurrentDataFlat, state.lastSavedDataFlat),
      });
    }
  }, [
    mutation,
    hasUnsavedDebouncedChanges,
    state.debouncedCurrentData,
    state.debouncedCurrentDataFlat,
    state.lastSavedDataFlat,
  ]);

  return {
    ...state,
    isSaving,
    hasUnsavedChanges,
    hasUnsavedDebouncedChanges,
    dispatch,
  };
};

export function FormDataProvider({ children }) {
  const { dispatch, ...rest } = useFormDataQuery();

  return (
    <Provider
      value={{
        ...rest,
        methods: {
          setLeafValue: (path, newValue) =>
            dispatch({
              type: 'setLeafValue',
              path,
              newValue,
            }),
        },
      }}
    >
      {children}
    </Provider>
  );
}

function useCurrentData(freshness: 'current' | 'debounced' = 'debounced') {
  const { currentData, debouncedCurrentData } = useCtx();
  return freshness === 'current' ? currentData : debouncedCurrentData;
}

export const NewFD: IFormDataFunctionality = {
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
