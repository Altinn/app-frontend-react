/* eslint-disable no-console */
import { useRef } from 'react';

import dot from 'dot-object';
import deepEqual from 'fast-deep-equal';
import { original } from 'immer';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { diffModels } from 'src/features/formData/diffModels';
import { useFormDataWriteGatekeepers } from 'src/features/formData/FormDataWriteGatekeepers';
import { runLegacyRules } from 'src/features/formData/LegacyRules';
import type { IRuleConnections } from 'src/features/form/dynamics';
import type { FormDataWriteGatekeepers } from 'src/features/formData/FormDataWriteGatekeepers';
import type { IFormData } from 'src/features/formData/index';

export const DEFAULT_DEBOUNCE_TIMEOUT = 400;

export interface FormDataState {
  // These values contain the current data model, with the values immediately available whenever the user is typing.
  // Use these values to render the form, and for other cases where you need the current data model immediately.
  currentData: object;

  // These values contain the current data model, with the values debounced at 400ms. This means that if the user is
  // typing, the values will be updated 400ms after the user stopped typing. Use these values when you need to perform
  // expensive operations on the data model, such as validation, calculations, or sending a request to save the model.
  debouncedCurrentData: object;

  // These values contain the last saved data model, with the values that were last saved to the server. We use this
  // to determine if there are any unsaved changes, and to diff the current data model against the last saved data
  // model when saving. You probably don't need to use these values directly unless you know what you're doing.
  lastSavedData: object;

  // The time in milliseconds to debounce the currentData model. This is used to determine how long to wait after the
  // user has stopped typing before updating that data into the debouncedCurrentData model. Usually this will follow
  // the default value, it can also be changed at any time by each component that uses the FormDataWriter.
  debounceTimeout: number;
}

export interface FDChange {
  // Overrides the timeout before the change is applied to the debounced data model. If not set, the default
  // timeout is used. The debouncing may also happen sooner than you think, if the user continues typing in
  // a form field that has a lower timeout. This is because the debouncing is global, not per field.
  debounceTimeout?: number;
}

export interface FDNewValue extends FDChange {
  path: string;
  newValue: string;
}

export interface FDNewValues extends FDChange {
  changes: FDNewValue[];
}

export interface FDAppendToListUnique extends FDChange {
  path: string;
  newValue: any;
}

export interface FDRemoveIndexFromList extends FDChange {
  path: string;
  index: number;
}

export interface FDRemoveValueFromList extends FDChange {
  path: string;
  value: any;
}

export interface FormDataMethods {
  // Methods used for updating the data model. These methods will update the currentData model, and after
  // the freeze() method is called, the debouncedCurrentData model will be updated as well.
  setLeafValue: (change: FDNewValue) => void;
  setMultiLeafValues: (changes: FDNewValues) => void;
  appendToListUnique: (change: FDAppendToListUnique) => void;
  removeIndexFromList: (change: FDRemoveIndexFromList) => void;
  removeValueFromList: (change: FDRemoveValueFromList) => void;

  // Internal utility methods
  freeze: (ruleConnection: IRuleConnections | null) => void;
  saveFinished: (savedData: object, changedFields?: IFormData) => void;
}

export type FormDataContext = FormDataState & FormDataMethods;

function makeActions(set: (fn: (state: FormDataContext) => void) => void): FormDataMethods {
  function processChange(state: FormDataContext, change: FDChange) {
    state.debounceTimeout = change.debounceTimeout ?? DEFAULT_DEBOUNCE_TIMEOUT;
  }

  return {
    freeze: (ruleConnection) =>
      set((state) => {
        const currentDataFlat = dot.dot(state.currentData);
        const debouncedCurrentDataFlat = dot.dot(state.debouncedCurrentData);
        const diff = diffModels(currentDataFlat, debouncedCurrentDataFlat);
        const changes = runLegacyRules(ruleConnection, currentDataFlat, new Set(Object.keys(diff)));
        for (const { path, newValue } of changes) {
          dot.str(path, newValue, state.currentData);
        }

        state.debouncedCurrentData = state.currentData;
      }),

    // TODO: Create tests for this action, it's getting complex
    saveFinished: (savedData, changedFields) =>
      set((state) => {
        if (changedFields && Object.keys(changedFields).length > 0) {
          console.log('debug, saveFinished, changes', changedFields);
          const asSaved = structuredClone(savedData);
          for (const path of Object.keys(changedFields)) {
            const newValue = changedFields[path];
            if (newValue === null) {
              continue; // TODO: Remove this when backend stops sending us null values that should be objects
            }

            // Currently, all data model values are saved as strings
            const newValueAsString = String(newValue);
            dot.str(path, newValueAsString, state.currentData);
            dot.str(path, newValueAsString, asSaved);
          }

          const beforeChanges = original(state.currentData);
          if (deepEqual(beforeChanges, state.debouncedCurrentData)) {
            // If these are equal, the user hasn't yet made any changes to the data model since we started changing the
            // data above. We can safely freeze now, so as not to trigger a new save request.
            state.debouncedCurrentData = state.currentData;
          } else {
            console.log('debug, saveFinished, changes to debouncedCurrentData');
          }

          if (deepEqual(beforeChanges, asSaved)) {
            // If these are equal, the user hasn't yet made any changes to the data model since we last saved. We can
            // safely update the last saved data now, so that we don't trigger a new save request.
            state.lastSavedData = state.currentData;
          } else {
            state.lastSavedData = asSaved;
            console.log('debug, saveFinished, changes to lastSavedData');
          }
        } else {
          state.lastSavedData = savedData;
          console.log('debug, saveFinished, no changes reported');
        }
      }),
    setLeafValue: ({ path, newValue, ...rest }) =>
      set((state) => {
        const existingValue = dot.pick(path, state.currentData);
        if (existingValue === newValue) {
          console.log('debug, setLeafValueImpl no-change', path, newValue);
          return;
        }

        processChange(state, rest);
        dot.str(path, newValue, state.currentData);
        console.log('debug, setLeafValueImpl', path, newValue);
      }),
    appendToListUnique: ({ path, newValue, ...rest }) =>
      set((state) => {
        const existingValue = dot.pick(path, state.currentData);
        if (existingValue.includes(newValue)) {
          console.log('debug, appendToListImpl no-change', path, newValue);
          return;
        }

        processChange(state, rest);
        dot.str(path, [...existingValue, newValue], state.currentData);
        console.log('debug, appendToListImpl', path, newValue);
      }),
    removeIndexFromList: ({ path, index, ...rest }) =>
      set((state) => {
        const existingValue = dot.pick(path, state.currentData);
        if (index >= existingValue.length) {
          console.log('debug, removeIndexFromListImpl no-change', path, index);
          return;
        }

        processChange(state, rest);
        throw new Error('Not implemented');
      }),
    removeValueFromList: ({ path, value, ...rest }) =>
      set((state) => {
        const existingValue = dot.pick(path, state.currentData);
        if (!existingValue.includes(value)) {
          console.log('debug, removeValueFromListImpl no-change', path, value);
          return;
        }

        processChange(state, rest);
        throw new Error('Not implemented');
      }),
    setMultiLeafValues: ({ changes, ...rest }) =>
      set((state) => {
        console.log('debug, setMultiLeafValuesImpl', changes);
        let changesFound = false;
        for (const { path, newValue } of changes) {
          const existingValue = dot.pick(path, state.currentData);
          if (existingValue === newValue) {
            continue;
          }
          dot.str(path, newValue, state.currentData);
          changesFound = true;
        }
        changesFound && processChange(state, rest);
      }),
  };
}

const createFormDataWriteStore = (initialData: object, gatekeepers: FormDataWriteGatekeepers) =>
  createStore<FormDataContext>()(
    immer((set) => {
      const actions = makeActions(set);
      for (const _fnName of Object.keys(actions)) {
        const fnName = _fnName as keyof FormDataMethods;
        const fn = actions[fnName] as (...args: any[]) => void;
        const gatekeeper = gatekeepers[fnName] as (...args: any[]) => boolean;
        actions[fnName] = (...args: any[]) => {
          if (!gatekeeper(...args)) {
            return;
          }

          fn(...args);
        };
      }

      return {
        currentData: initialData,
        debouncedCurrentData: initialData,
        lastSavedData: initialData,
        debounceTimeout: DEFAULT_DEBOUNCE_TIMEOUT,
        ...actions,
      };
    }),
  );

export const useFormDataWriteStateMachine = (initialData: object) => {
  const storeRef = useRef<ReturnType<typeof createFormDataWriteStore> | undefined>();
  const gatekeepers = useFormDataWriteGatekeepers();

  if (!storeRef.current) {
    storeRef.current = createFormDataWriteStore(initialData, gatekeepers);
  }

  return storeRef.current;
};
