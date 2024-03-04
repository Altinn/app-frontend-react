/* eslint-disable no-console */
import React, { useCallback, useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { useMutation } from '@tanstack/react-query';
import dot from 'dot-object';
import deepEqual from 'fast-deep-equal';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { ContextNotProvided } from 'src/core/contexts/context';
import { createZustandContext } from 'src/core/contexts/zustandContext';
import { useCurrentDataModelSchemaLookup } from 'src/features/datamodel/DataModelSchemaProvider';
import { useRuleConnections } from 'src/features/form/dynamics/DynamicsContext';
import { useFormDataWriteProxies } from 'src/features/formData/FormDataWriteProxies';
import { createFormDataWriteStore } from 'src/features/formData/FormDataWriteStateMachine';
import { createPatch } from 'src/features/formData/jsonPatch/createPatch';
import { useAsRef } from 'src/hooks/useAsRef';
import { useWaitForState } from 'src/hooks/useWaitForState';
import { useIsStatelessApp } from 'src/utils/useIsStatelessApp';
import type { SchemaLookupTool } from 'src/features/datamodel/DataModelSchemaProvider';
import type { IRuleConnections } from 'src/features/form/dynamics';
import type { FormDataWriteProxies } from 'src/features/formData/FormDataWriteProxies';
import type { FDSaveResult, FormDataContext } from 'src/features/formData/FormDataWriteStateMachine';
import type { BackendValidationIssueGroups } from 'src/features/validation';
import type { FormDataSelector } from 'src/layout';
import type { IMapping } from 'src/layout/common.generated';
import type { IDataModelBindings } from 'src/layout/layout';

export type FDLeafValue = string | number | boolean | null | undefined;
export type FDValue = FDLeafValue | object | FDValue[];

interface MutationArg {
  dataModelUrl: string;
}

interface FormDataContextInitialProps {
  url: string;
  initialData: object;
  autoSaving: boolean;
  proxies: FormDataWriteProxies;
  ruleConnections: IRuleConnections | null;
  schemaLookup: SchemaLookupTool;
}

const {
  Provider,
  useSelector,
  useMemoSelector,
  useSelectorAsRef,
  useLaxDelayedMemoSelectorFactory,
  useDelayedMemoSelectorFactory,
  useLaxSelector,
  useLaxStore,
} = createZustandContext({
  name: 'FormDataWrite',
  required: true,
  initialCreateStore: ({
    url,
    initialData,
    autoSaving,
    proxies,
    ruleConnections,
    schemaLookup,
  }: FormDataContextInitialProps) =>
    createFormDataWriteStore(url, initialData, autoSaving, proxies, ruleConnections, schemaLookup),
});

const useFormDataSaveMutation = () => {
  const { doPatchFormData, doPostStatelessFormData } = useAppMutations();
  const saveStarted = useSelector((s) => s.saveStarted);
  const saveFinished = useSelector((s) => s.saveFinished);
  const cancelSave = useSelector((s) => s.cancelSave);
  const isStateless = useIsStatelessApp();
  const lastSavedAsRef = useSelectorAsRef((s) => s.lastSavedData);
  const debouncedAsRef = useSelectorAsRef((s) => s.debouncedCurrentData);
  const isSavingRef = useSelectorAsRef((s) => s.controlState.isSaving);

  return useMutation({
    mutationKey: ['saveFormData'],
    mutationFn: async (arg: MutationArg) => {
      const { dataModelUrl } = arg;
      if (isSavingRef.current) {
        return;
      }
      const next = debouncedAsRef.current;
      const prev = lastSavedAsRef.current;
      if (deepEqual(prev, next)) {
        cancelSave();
        return;
      }

      saveStarted();
      if (isStateless) {
        const newDataModel = await doPostStatelessFormData(dataModelUrl, next);
        saveFinished({ newDataModel, savedData: next, validationIssues: undefined });
      } else {
        const patch = createPatch({ prev, next });
        if (patch.length === 0) {
          cancelSave();
          return;
        }

        const result = await doPatchFormData(dataModelUrl, {
          patch,
          ignoredValidators: [],
        });
        saveFinished({ ...result, patch, savedData: next });
      }
    },
  });
};

interface FormDataWriterProps extends PropsWithChildren {
  url: string;
  initialData: object;
  autoSaving: boolean;
}

export function FormDataWriteProvider({ url, initialData, autoSaving, children }: FormDataWriterProps) {
  const proxies = useFormDataWriteProxies();
  const ruleConnections = useRuleConnections();
  const schemaLookup = useCurrentDataModelSchemaLookup();

  return (
    <Provider
      url={url}
      autoSaving={autoSaving}
      proxies={proxies}
      initialData={initialData}
      ruleConnections={ruleConnections}
      schemaLookup={schemaLookup}
    >
      <FormDataEffects url={url} />
      {children}
    </Provider>
  );
}

function FormDataEffects({ url }: { url: string }) {
  const state = useSelector((s) => s);
  const {
    currentData,
    debouncedCurrentData,
    lastSavedData,
    controlState,
    invalidCurrentData,
    invalidDebouncedCurrentData,
  } = state;
  const { debounceTimeout, autoSaving, manualSaveRequested, lockedBy, isSaving } = controlState;
  const { mutate, error } = useFormDataSaveMutation();
  const debounce = useDebounceImmediately();
  const hasUnsavedChanges = useHasUnsavedChanges();

  // If errors occur, we want to throw them so that the user can see them, and they
  // can be handled by the error boundary.
  if (error) {
    throw error;
  }

  const performSave = useCallback(() => mutate({ dataModelUrl: url }), [mutate, url]);

  // Debounce the data model when the user stops typing. This has the effect of triggering the useEffect below,
  // saving the data model to the backend. Freezing can also be triggered manually, when a manual save is requested.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentData !== debouncedCurrentData || invalidCurrentData !== invalidDebouncedCurrentData) {
        debounce();
      }
    }, debounceTimeout);

    return () => clearTimeout(timer);
  }, [debounce, currentData, debouncedCurrentData, debounceTimeout, invalidCurrentData, invalidDebouncedCurrentData]);

  // Save the data model when the data has been frozen to debouncedCurrentData and is different from the saved data
  useEffect(() => {
    const isDebounced = currentData === debouncedCurrentData;
    if (isDebounced && !isSaving && !lockedBy && (autoSaving || manualSaveRequested)) {
      const hasUnsavedDebouncedChanges =
        debouncedCurrentData !== lastSavedData && !deepEqual(debouncedCurrentData, lastSavedData);

      if (hasUnsavedDebouncedChanges) {
        performSave();
      }
    }
  }, [
    autoSaving,
    currentData,
    debouncedCurrentData,
    isSaving,
    lastSavedData,
    lockedBy,
    manualSaveRequested,
    performSave,
  ]);

  // Marking the document as having unsaved changes. The data attribute is used in tests, while the beforeunload
  // event is used to warn the user when they try to navigate away from the page with unsaved changes.
  useEffect(() => {
    document.body.setAttribute('data-unsaved-changes', hasUnsavedChanges.toString());
    window.onbeforeunload = hasUnsavedChanges ? () => true : null;

    return () => {
      document.body.removeAttribute('data-unsaved-changes');
      window.onbeforeunload = null;
    };
  }, [hasUnsavedChanges]);

  // Always save unsaved changes when the user navigates away from the page and this component is unmounted.
  // We cannot put the current and last saved data in the dependency array, because that would cause the effect
  // to trigger when the user is typing, which is not what we want.
  useEffect(
    () => () => {
      if (hasUnsavedChanges) {
        debounce();
      }
    },
    [debounce, hasUnsavedChanges],
  );

  // Sets the debounced data in the window object, so that Cypress tests can access it.
  useEffect(() => {
    if (window.Cypress) {
      window.CypressState = { ...window.CypressState, formData: debouncedCurrentData };
    }
  }, [debouncedCurrentData]);

  return null;
}

const useRequestManualSave = () => {
  const requestSave = useLaxSelector((s) => s.requestManualSave);
  return useCallback(
    (setTo?: boolean) => {
      if (requestSave !== ContextNotProvided) {
        requestSave(setTo);
      }
    },
    [requestSave],
  );
};

const useDebounceImmediately = () => {
  const debounce = useLaxSelector((s) => s.debounce);
  return useCallback(() => {
    if (debounce !== ContextNotProvided) {
      debounce();
    }
  }, [debounce]);
};

function hasUnsavedChanges(state: FormDataContext) {
  if (state.controlState.isSaving) {
    return true;
  }
  if (state.currentData !== state.lastSavedData) {
    return true;
  }
  return state.debouncedCurrentData !== state.lastSavedData;
}

const useHasUnsavedChanges = () => {
  const result = useLaxSelector((state) => hasUnsavedChanges(state));
  if (result === ContextNotProvided) {
    return false;
  }
  return result;
};

const useWaitForSave = () => {
  const requestSave = useRequestManualSave();
  const url = useLaxSelector((s) => s.controlState.saveUrl);
  const waitFor = useWaitForState<
    BackendValidationIssueGroups | undefined,
    FormDataContext | typeof ContextNotProvided
  >(useLaxStore());

  return useCallback(
    async (requestManualSave = false): Promise<BackendValidationIssueGroups | undefined> => {
      if (url === ContextNotProvided) {
        return Promise.resolve(undefined);
      }

      if (requestManualSave) {
        requestSave();
      }

      return await waitFor((state, setReturnValue) => {
        if (state === ContextNotProvided) {
          setReturnValue(undefined);
          return true;
        }
        if (state.controlState.isSaving) {
          return false;
        }
        if (hasUnsavedChanges(state)) {
          return false;
        }

        setReturnValue(state.validationIssues);
        return true;
      });
    },
    [requestSave, url, waitFor],
  );
};

const emptyObject: any = {};

export const FD = {
  /**
   * Gives you a selector function that can be used to look up paths in the data model. This is similar to
   * useDebounced(), but it will only re-render the component if the value at the path(s) you selected actually
   * changes. This is useful if you want to avoid re-rendering when the form data changes, but you still want to
   * pretend to have the full data model available to look up values from.
   */
  useDebouncedSelector(): FormDataSelector {
    return useDelayedMemoSelectorFactory({
      selector: (path: string) => (state) => dot.pick(path, state.debouncedCurrentData),
      makeCacheKey: (path: string) => path,
    });
  },

  /**
   * This will return the form data as a deep object, just like the server sends it to us (and the way we send it back).
   * This will always give you the debounced data, which may or may not be saved to the backend yet.
   */
  useDebounced(): object {
    return useSelector((v) => v.debouncedCurrentData);
  },

  /**
   * This is the same as useDebouncedSelector(), but will return ContextNotProvided immediately if the context
   * provider is not present.
   */
  useLaxDebouncedSelector(): FormDataSelector | typeof ContextNotProvided {
    return useLaxDelayedMemoSelectorFactory({
      selector: (path: string) => (state) => dot.pick(path, state.debouncedCurrentData),
      makeCacheKey: (path: string) => path,
    });
  },

  /**
   * This will pick a value from the form data, and return it. The path is expected to be a dot-separated path, and
   * the value will be returned as-is. If the value is not found, undefined is returned. Null may also be returned if
   * the value is explicitly set to null.
   */
  useDebouncedPick(path: string): FDValue {
    return useSelector((v) => dot.pick(path, v.debouncedCurrentData));
  },

  /**
   * This returns multiple values, as picked from the form data. The values in the input object is expected to be
   * dot-separated paths, and the return value will be an object with the same keys, but with the values picked
   * from the form data. If a value is not found, undefined is returned. Null may also be returned if the value
   * is explicitly set to null.
   */
  useFreshBindings: <T extends IDataModelBindings | undefined, O extends 'raw' | 'string'>(
    bindings: T,
    dataAs: O,
  ): T extends undefined ? Record<string, never> : { [key in keyof T]: O extends 'raw' ? FDValue : string } =>
    useMemoSelector((s) => {
      if (!bindings || Object.keys(bindings).length === 0) {
        return emptyObject;
      }
      const out: any = {};
      for (const key of Object.keys(bindings)) {
        const invalidValue = dot.pick(bindings[key], s.invalidCurrentData);
        if (invalidValue !== undefined) {
          out[key] = invalidValue;
          continue;
        }

        const value = dot.pick(bindings[key], s.currentData);
        if (dataAs === 'raw') {
          out[key] = value;
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          out[key] = String(value);
        } else {
          out[key] = '';
        }
      }

      return out;
    }),

  /**
   * This returns multiple values, as picked from the form data. The values in the input object is expected to be
   * dot-separated paths, and the return value will be an object with the same keys, but with boolean values
   * indicating whether the current value is valid according to the schema or not. As an example, when typing '-5' into
   * a number field that maps to a number-typed property in the data model, the value will be invalid when the user
   * has only typed the '-' sign, but will be valid when the user has typed '-5'. We still store the invalid value
   * temporarily, so that the user can see what they have typed, but we don't send that value to the backend, even
   * when the user stops typing and the invalid value stays. This hook allows you to check whether the value is valid
   * and warn the user if it is not.
   */
  useBindingsAreValid: <T extends IDataModelBindings | undefined>(bindings: T): { [key in keyof T]: boolean } =>
    useMemoSelector((s) => {
      if (!bindings || Object.keys(bindings).length === 0) {
        return emptyObject;
      }
      const out: any = {};
      for (const key of Object.keys(bindings)) {
        out[key] = dot.pick(bindings[key], s.invalidCurrentData) === undefined;
      }
      return out;
    }),

  /**
   * This returns the current invalid data which cannot be saved to backend as an object. For example, this will
   * include data such as a stringy `-` in a number field (where presumably the user will type the rest of the number
   * later, such as `-5`). As this is the debounced data, it will only be updated when the user stops typing for a
   * while, so that this model can be used for i.e. validation messages.
   */
  useInvalidDebounced(): object {
    return useSelector((v) => v.invalidDebouncedCurrentData);
  },

  /**
   * This returns an object that can be used to generate a query string for parts of the current form data.
   * It is almost the same as usePickFreshStrings(), but with important differences:
   *   1. The _keys_ in the input are expected to contain the data model paths, not the values. Mappings are reversed
   *      in that sense.
   *   2. The data is fetched from the debounced model, not the fresh/current one. That ensures queries that are
   *      generated from this hook are more stable, and aren't re-fetched on every keystroke.
   */
  useMapping: <D extends 'string' | 'raw' = 'string'>(
    mapping: IMapping | undefined,
    dataAs?: D,
  ): D extends 'raw' ? { [key: string]: FDValue } : { [key: string]: string } =>
    useMemoSelector((s) => {
      const realDataAs = dataAs || 'string';
      const out: any = {};
      if (mapping) {
        for (const key of Object.keys(mapping)) {
          const outputKey = mapping[key];
          const value = dot.pick(key, s.debouncedCurrentData);

          if (realDataAs === 'raw') {
            out[outputKey] = value;
          } else if (typeof value === 'undefined' || value === null) {
            out[outputKey] = '';
          } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            out[outputKey] = String(value);
          } else {
            out[outputKey] = JSON.stringify(value);
          }
        }
      }
      return out;
    }),

  /**
   * This returns the raw method for setting a value in the form data. This is useful if you want to
   * set a value in the form data. This is probably too low-level for what you really want to do, so
   * consider using something like useDataModelBindings() instead.
   * @see useDataModelBindings
   */
  useSetLeafValue: () => useSelector((s) => s.setLeafValue),

  /**
   * This returns the raw method for setting multiple leaf values in the form data at once. This is
   * useful if you want to many values at the same time, atomically. This is probably too low-level
   * for what you really want to do, so consider using something like useDataModelBindings() instead.
   * @see useDataModelBindings
   */
  useSetMultiLeafValues: () => useSelector((s) => s.setMultiLeafValues),

  /**
   * The locking functionality allows you to prevent form data from saving, even if the user stops typing (or navigates
   * to the next page). This is useful if you want to perform a server-side action that requires the form data to be
   * in a certain state. Locking will effectively ignore all saving until you unlock it again.
   */
  useLocking(lockId: string) {
    const rawLock = useSelector((s) => s.lock);
    const rawUnlock = useSelector((s) => s.unlock);
    const requestSave = useRequestManualSave();

    const lockedBy = useSelector((s) => s.controlState.lockedBy);
    const lockedByRef = useSelectorAsRef((s) => s.controlState.lockedBy);
    const isLocked = useCallback(() => lockedByRef.current !== undefined, [lockedByRef]);
    const isLockedByMe = useCallback(() => lockedByRef.current === lockId, [lockedByRef, lockId]);

    const hasUnsavedChanges = useHasUnsavedChanges();
    const hasUnsavedChangesRef = useAsRef(hasUnsavedChanges);
    const waitForSave = useWaitForSave();

    const lock = useCallback(async () => {
      if (isLocked() && !isLockedByMe()) {
        window.logWarn(
          `Form data is already locked by ${lockedByRef.current}, cannot lock it again (requested by ${lockId})`,
        );
      }
      if (isLocked()) {
        return false;
      }

      if (hasUnsavedChangesRef.current) {
        requestSave();
        await waitForSave();
      }

      rawLock(lockId);
      return true;
    }, [hasUnsavedChangesRef, isLocked, isLockedByMe, lockId, lockedByRef, rawLock, requestSave, waitForSave]);

    const unlock = useCallback(
      (saveResult?: FDSaveResult) => {
        if (!isLocked()) {
          window.logWarn(`Form data is not locked, cannot unlock it (requested by ${lockId})`);
        }
        if (!isLockedByMe()) {
          window.logWarn(`Form data is locked by ${lockedByRef.current}, cannot unlock it (requested by ${lockId})`);
        }
        if (!isLocked() || !isLockedByMe()) {
          return false;
        }

        rawUnlock(saveResult);
        return true;
      },
      [isLocked, isLockedByMe, lockId, lockedByRef, rawUnlock],
    );

    return { lock, unlock, isLocked, lockedBy, isLockedByMe };
  },

  /**
   * Returns a function you can use to debounce saved form data
   * This will work (and return immediately) even if there is no FormDataWriteProvider in the tree.
   */
  useDebounceImmediately,

  /**
   * Returns a function you can use to wait until the form data is saved.
   * This will work (and return immediately) even if there is no FormDataWriteProvider in the tree.
   */
  useWaitForSave,

  /**
   * Returns true if the form data has unsaved changes
   * This will work (and return false) even if there is no FormDataWriteProvider in the tree.
   */
  useHasUnsavedChanges,

  /**
   * Returns a function to append a value to a list. It checks if the value is already in the list, and if not,
   * it will append it. If the value is already in the list, it will not be appended.
   */
  useAppendToListUnique: () => useSelector((s) => s.appendToListUnique),

  /**
   * Returns a function to append a value to a list. It will always append the value, even if it is already in the list.
   */
  useAppendToList: () => useSelector((s) => s.appendToList),

  /**
   * Returns a function to remove a value from a list, by use of a callback that lets you find the correct row to
   * remove. When the callback returns true, that row will be removed.
   */
  useRemoveFromListCallback: () => useSelector((s) => s.removeFromListCallback),

  /**
   * Returns a function to remove a value from a list, by value. If your list contains unique values, this is the
   * safer alternative to useRemoveIndexFromList().
   */
  useRemoveValueFromList: () => useSelector((s) => s.removeValueFromList),

  /**
   * Returns the latest validation issues from the backend, from the last time the form data was saved.
   */
  useLastSaveValidationIssues: () => useSelector((s) => s.validationIssues),
};
