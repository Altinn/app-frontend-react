import React from 'react';

import { useMutation } from '@tanstack/react-query';
import dot from 'dot-object';
import deepEqual from 'fast-deep-equal';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import {
  createFormDataRequestFromDiff,
  createFormDataRequestLegacy,
  diffModels,
} from 'src/features/formData/submit/submitFormDataSagas';
import { runLegacyRules } from 'src/features/formData2/LegacyRules';
import { UseNewFormDataHook } from 'src/features/toggles';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useDebounce } from 'src/hooks/useDebounce';
import { getCurrentTaskDataElementId } from 'src/utils/appMetadata';
import { createStrictContext } from 'src/utils/createStrictContext';
import { flattenObject } from 'src/utils/databindings';
import type { IFormData } from 'src/features/formData';
import type { IFormDataFunctionality, IFormDataMethods } from 'src/features/formData2/types';

interface FormDataStorage {
  data: object;
  saving: boolean;
  unsavedChanges: boolean;
  methods: IFormDataMethods;
}

interface MutationArg {
  newData: object;
  diff: Record<string, any>;
}

export interface DataModelChange {
  path: string;
  newValue: string;
}

type MutatorFunc = (currentModel: object) => object;

const [Provider, useFormData] = createStrictContext<FormDataStorage>();

const setLeafValueImpl =
  ({ path, newValue }: DataModelChange): MutatorFunc =>
  (current) => {
    if (dot.pick(path, current) === newValue) {
      console.log('debug, setLeafValueImpl no-change', path, newValue);
      return current;
    }

    const newModel = structuredClone(current);
    console.log('debug, setLeafValueImpl', path, newValue);
    dot.str(path, newValue, newModel);
    return newModel;
  };

const setMultiLeafValuesImpl =
  (changes: DataModelChange[]): MutatorFunc =>
  (current) => {
    const newModel = structuredClone(current);
    console.log('debug, setMultiLeafValuesImpl', changes);
    for (const change of changes) {
      dot.str(change.path, change.newValue, newModel);
    }
    return newModel;
  };

const useFormDataUuid = () =>
  useAppSelector((state) =>
    getCurrentTaskDataElementId(
      state.applicationMetadata.applicationMetadata,
      state.instanceData.instance,
      state.formLayout.layoutsets,
    ),
  );

const useFormDataQuery = () => {
  const { fetchFormData, putFormData } = useAppQueriesContext();
  const useMultiPart = useAppSelector(
    (state) => state.applicationMetadata.applicationMetadata?.features?.multiPartSave,
  );

  const [fetchedUuid, setFetchedUuid] = React.useState('');
  const [currentData, setCurrentData] = React.useState<object>({});
  const [lastSavedData, setLastSavedData] = React.useState<object>({});
  const debouncedCurrentData = useDebounce(currentData, 400);
  const ruleConnection = useAppSelector((state) => state.formDynamics.ruleConnection);

  const uuid = useFormDataUuid();
  const enabled = uuid !== undefined && UseNewFormDataHook;

  const mutation = useMutation(async (arg?: MutationArg) => {
    if (!enabled) {
      return;
    }

    if (fetchedUuid !== uuid) {
      const _result = await fetchFormData(uuid);
      setCurrentData(_result);
      setLastSavedData(_result);
      setFetchedUuid(uuid);
      console.log('debug, initial fetch done');
      return;
    }

    if (!arg) {
      throw new Error('Argument required for saving form data');
    }

    const { newData, diff } = arg;
    const { data } = useMultiPart ? createFormDataRequestFromDiff(newData, diff) : createFormDataRequestLegacy(newData);

    try {
      console.log('debug, saving form data');
      const _result = await putFormData(uuid, data);
      console.log('debug, saving result', _result);
      // handleChangedFields(data?.changedFields, formDataCopy);
    } catch (error) {
      if (error.response && error.response.status === 303) {
        // 303 means that data has been changed by calculation on server. Try to update from response.
        // Newer backends might not reply back with this special response code when there are changes, they
        // will just respond with the 'changedFields' property instead (see code handling this above).
        if (error.response.data?.changedFields) {
          console.log('debug, saving form data with changedFields', error.response.data.changedFields);
          // handleChangedFields(data?.changedFields, formDataCopy);
        } else {
          // No changedFields property returned, try to fetch
          console.log('debug, no changedFields returned, will re-fetch');
        }
      } else {
        throw error;
      }
    }

    console.log('debug, saving form data done');
    setLastSavedData(newData);
  });

  React.useEffect(() => {
    if (enabled && fetchedUuid !== uuid) {
      mutation.mutate(undefined);
    }
  }, [mutation, enabled, fetchedUuid, uuid]);

  const hasUnsavedChanges =
    enabled && debouncedCurrentData !== undefined && !deepEqual(debouncedCurrentData, lastSavedData);

  React.useEffect(() => {
    if (hasUnsavedChanges) {
      let modelToSave = structuredClone(debouncedCurrentData);
      const prev = flattenObject(lastSavedData);
      const current = flattenObject(modelToSave);
      let diff = diffModels(current, prev);
      const ruleChanges = runLegacyRules(ruleConnection, current, new Set(Object.keys(diff)));
      console.log('debug, rule changes', ruleChanges);

      if (ruleChanges.length) {
        modelToSave = setMultiLeafValuesImpl(ruleChanges)(modelToSave);
        setCurrentData(setMultiLeafValuesImpl(ruleChanges)); // TODO: Prevent double-saving
        diff = diffModels(flattenObject(modelToSave), prev);
      }

      mutation.mutate({
        newData: modelToSave,
        diff,
      });
    }
  }, [mutation, ruleConnection, debouncedCurrentData, lastSavedData, hasUnsavedChanges]);

  const isSaving = mutation.isLoading;
  console.log('debug, hasUnsavedChanges', hasUnsavedChanges, 'enabled', enabled, 'isSaving', isSaving);

  return {
    data: currentData,
    setCurrentData,
    saving: isSaving,
    hasUnsavedChanges,
  };
};

export function FormDataProvider({ children }) {
  const { data, setCurrentData, saving, hasUnsavedChanges } = useFormDataQuery();

  return (
    <Provider
      value={{
        data,
        saving,
        unsavedChanges: hasUnsavedChanges,
        methods: {
          setLeafValue: (path, newValue) => setCurrentData(setLeafValueImpl({ path, newValue })),
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
  const { data } = useFormData();
  return React.useMemo(() => flattenObject(data), [data]);
}

function useMethods(): IFormDataMethods {
  const { methods } = useFormData();
  return methods;
}

export const NewFD: IFormDataFunctionality = {
  useAsDotMap,
  useMethods,
};
