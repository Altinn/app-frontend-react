import React from 'react';

import { useMutation } from '@tanstack/react-query';
import dot from 'dot-object';
import deepEqual from 'fast-deep-equal';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { createFormDataRequestCompatible } from 'src/features/formData/submit/submitFormDataSagas';
import { UseNewFormDataHook } from 'src/features/toggles';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useDebounce } from 'src/hooks/useDebounce';
import { getCurrentTaskDataElementId } from 'src/utils/appMetadata';
import { createStrictContext } from 'src/utils/createStrictContext';
import { flattenObject } from 'src/utils/databindings';
import type { IFormData } from 'src/features/formData';
import type { IFormDataFunctionality, IFormDataMethods } from 'src/features/formData2/types';

interface FormDataStorage {
  currentData: object;
  lastSavedData: object;
  saving: boolean;
  unsavedChanges: boolean;
  methods: IFormDataMethods;
}

const [Provider, useFormData] = createStrictContext<FormDataStorage>();

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

  const [currentData, setCurrentData] = React.useState<object | undefined>(undefined);
  const [lastSavedData, setLastSavedData] = React.useState<object | undefined>(undefined);
  const debouncedCurrentData = useDebounce(currentData, 400);

  const uuid = useFormDataUuid();
  const enabled = uuid !== undefined && UseNewFormDataHook;
  const initialFetchDone = currentData !== undefined;

  const mutation = useMutation(async (newData?: object) => {
    if (!enabled) {
      return;
    }

    if (!initialFetchDone) {
      const _result = await fetchFormData(uuid);
      setCurrentData(_result);
      setLastSavedData(_result);
      return;
    }

    const { data } = createFormDataRequestCompatible(
      useMultiPart,
      flattenObject(newData),
      flattenObject(lastSavedData),
      newData,
    );

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

    setLastSavedData(newData);
  });

  React.useEffect(() => {
    if (enabled && !initialFetchDone) {
      mutation.mutate(undefined);
    }
  }, [mutation, enabled, initialFetchDone]);

  React.useEffect(() => {
    if (debouncedCurrentData !== undefined && !deepEqual(debouncedCurrentData, lastSavedData)) {
      mutation.mutate(debouncedCurrentData);
    }
  }, [mutation, debouncedCurrentData, lastSavedData]);

  const isSaving = mutation.isLoading;
  const hasUnsavedChanges = enabled && currentData !== undefined && currentData !== lastSavedData;

  return {
    currentData,
    setCurrentData,
    lastSavedData,
    setLastSavedData,
    isSaving,
    hasUnsavedChanges,
  };
};

export function FormDataProvider({ children }) {
  const { currentData, setCurrentData, lastSavedData, isSaving, hasUnsavedChanges } = useFormDataQuery();

  const setLeafValue: FormDataStorage['methods']['setLeafValue'] = (path, value) => {
    setCurrentData((current) => {
      const newCurrent = structuredClone(current);
      dot.str(path, value, newCurrent);
      return newCurrent;
    });
  };

  return (
    <Provider
      value={{
        currentData: currentData || {},
        lastSavedData: lastSavedData || {},
        saving: isSaving,
        unsavedChanges: hasUnsavedChanges,
        methods: {
          setLeafValue,
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
