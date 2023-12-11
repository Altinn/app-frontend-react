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
}

export interface FormDataMethods {
  // Methods used for updating the data model. These methods will update the currentData model, and after
  // the freeze() method is called, the debouncedCurrentData model will be updated as well.
  setLeafValue: (path: string, newValue: any) => void;
  setMultiLeafValues: (changes: DataModelChange[]) => void;
  appendToListUnique: (path: string, newValue: any) => void;
  removeIndexFromList: (path: string, index: number) => void;
  removeValueFromList: (path: string, value: any) => void;

  // Internal utility methods
  freeze: (ruleConnection: IRuleConnections | null) => void;
  saveFinished: (savedData: object, changedFields?: IFormData) => void;
}

export type FormDataContext = FormDataState & FormDataMethods;

export interface DataModelChange {
  path: string;
  newValue: string;
}

function makeActions(set: (fn: (state: FormDataContext) => void) => void): FormDataMethods {
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
    setLeafValue: (path, newValue) =>
      set((state) => {
        const existingValue = dot.pick(path, state.currentData);
        if (existingValue === newValue) {
          console.log('debug, setLeafValueImpl no-change', path, newValue);
          return;
        }

        dot.str(path, newValue, state.currentData);
        console.log('debug, setLeafValueImpl', path, newValue);
      }),
    appendToListUnique: (path, newValue) =>
      set((state) => {
        const existingValue = dot.pick(path, state.currentData);
        if (existingValue.includes(newValue)) {
          console.log('debug, appendToListImpl no-change', path, newValue);
          return;
        }

        dot.str(path, [...existingValue, newValue], state.currentData);
        console.log('debug, appendToListImpl', path, newValue);
      }),
    removeIndexFromList: (path, index) =>
      set((state) => {
        const existingValue = dot.pick(path, state.currentData);
        if (index >= existingValue.length) {
          console.log('debug, removeIndexFromListImpl no-change', path, index);
          return;
        }

        throw new Error('Not implemented');
      }),
    removeValueFromList: (path, value) =>
      set((state) => {
        const existingValue = dot.pick(path, state.currentData);
        if (!existingValue.includes(value)) {
          console.log('debug, removeValueFromListImpl no-change', path, value);
          return;
        }

        throw new Error('Not implemented');
      }),
    setMultiLeafValues: (changes) =>
      set((state) => {
        console.log('debug, setMultiLeafValuesImpl', changes);
        for (const { path, newValue } of changes) {
          const existingValue = dot.pick(path, state.currentData);
          if (existingValue === newValue) {
            continue;
          }
          dot.str(path, newValue, state.currentData);
        }
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
