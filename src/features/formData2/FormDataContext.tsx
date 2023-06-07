import React from 'react';

import { useMutation } from '@tanstack/react-query';
import deepEqual from 'fast-deep-equal';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import {
  createFormDataRequestFromDiff,
  createFormDataRequestLegacy,
  diffModels,
} from 'src/features/formData/submit/submitFormDataSagas';
import { useFormDataStateMachine } from 'src/features/formData2/StateMachine';
import { UseNewFormDataHook } from 'src/features/toggles';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useDebounce } from 'src/hooks/useDebounce';
import { getCurrentTaskDataElementId } from 'src/utils/appMetadata';
import { createStrictContext } from 'src/utils/createStrictContext';
import { flattenObject } from 'src/utils/databindings';
import type { IFormData } from 'src/features/formData';
import type { FDAction, FormDataStorage } from 'src/features/formData2/StateMachine';
import type { IFormDataFunctionality, IFormDataMethods } from 'src/features/formData2/types';

interface FormDataStorageExtended extends FormDataStorage {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
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

const [Provider, useFormData] = createStrictContext<FormDataStorageWithMethods>();

const useFormDataUuid = () =>
  useAppSelector((state) =>
    getCurrentTaskDataElementId(
      state.applicationMetadata.applicationMetadata,
      state.instanceData.instance,
      state.formLayout.layoutsets,
    ),
  );

const useFormDataQuery = (): FormDataStorageExtended & FormDataStorageInternal => {
  const { fetchFormData, putFormData } = useAppQueriesContext();
  const useMultiPart = useAppSelector(
    (state) => state.applicationMetadata.applicationMetadata?.features?.multiPartSave,
  );

  const [state, dispatch] = useFormDataStateMachine();
  const debouncedCurrentData = useDebounce(state.currentData, 400);
  const ruleConnection = useAppSelector((state) => state.formDynamics.ruleConnection);

  const uuid = useFormDataUuid();
  const enabled = uuid !== undefined && UseNewFormDataHook;

  const mutation = useMutation(async (arg?: MutationArg) => {
    if (!enabled) {
      return;
    }

    if (state.currentUuid !== uuid) {
      dispatch({
        type: 'initialFetch',
        data: await fetchFormData(uuid),
        uuid,
      });
      return;
    }

    if (!arg) {
      throw new Error('Argument required for saving form data');
    }

    const { newData, diff } = arg;
    const { data } = useMultiPart ? createFormDataRequestFromDiff(newData, diff) : createFormDataRequestLegacy(newData);

    try {
      const metaData: any = await putFormData(uuid, data);
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
  });

  React.useEffect(() => {
    if (enabled && state.currentUuid !== uuid) {
      mutation.mutate(undefined);
    }
  }, [mutation, enabled, state.currentUuid, uuid]);

  const isSaving = mutation.isLoading;
  const hasUnsavedChanges = enabled && debouncedCurrentData && !deepEqual(debouncedCurrentData, state.lastSavedData);

  React.useEffect(() => {
    if (hasUnsavedChanges) {
      const modelToSave = structuredClone(debouncedCurrentData);
      const prev = flattenObject(state.lastSavedData);
      const current = flattenObject(modelToSave);
      const diff = diffModels(current, prev);
      // const ruleChanges = runLegacyRules(ruleConnection, current, new Set(Object.keys(diff)));
      // console.log('debug, rule changes', ruleChanges);
      //
      // if (ruleChanges.length) {
      //   modelToSave = setMultiLeafValuesImpl(ruleChanges)(modelToSave);
      //   setCurrentData(setMultiLeafValuesImpl(ruleChanges)); // TODO: Prevent double-saving
      //   diff = diffModels(flattenObject(modelToSave), prev);
      // }

      mutation.mutate({
        newData: modelToSave,
        diff,
      });
    }
  }, [mutation, ruleConnection, debouncedCurrentData, state.lastSavedData, hasUnsavedChanges]);

  return {
    ...state,
    isSaving,
    hasUnsavedChanges,
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

/**
 * Returns the current form data, as a dot map. The dot map is a flat object where the keys are the
 * dot-separated paths to the values. No objects exist here, just leaf values.
 */
function useAsDotMap(): IFormData {
  const { currentData } = useFormData();
  return React.useMemo(() => flattenObject(currentData), [currentData]);
}

function useMethods(): IFormDataMethods {
  const { methods } = useFormData();
  return methods;
}

export const NewFD: IFormDataFunctionality = {
  useAsDotMap,
  useMethods,
};
