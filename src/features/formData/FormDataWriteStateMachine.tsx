/* eslint-disable no-console */

import dot from 'dot-object';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { diffModels } from 'src/features/formData/diffModels';
import { DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/index';
import { runLegacyRules } from 'src/features/formData/LegacyRules';
import { flattenObject } from 'src/utils/databindings';
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

  // Control state is used to control the behavior of form data.
  controlState: {
    // The time in milliseconds to debounce the currentData model. This is used to determine how long to wait after the
    // user has stopped typing before updating that data into the debouncedCurrentData model. Usually this will follow
    // the default value, it can also be changed at any time by each component that uses the FormDataWriter.
    debounceTimeout: number;

    // Auto-saving is turned on by default, and will automatically save the data model to the server whenever the
    // debouncedCurrentData model changes. This can be turned off when, for example, you want to save the data model
    // only when the user navigates to another page.
    autoSaving: boolean;

    // This is used to track whether the user has requested a manual save. When auto-saving is turned off, this is
    // the way we track when to save the data model to the server. It can also be used to trigger a manual save
    // as a way to immediately save the data model to the server, for example before locking the data model.
    manualSaveRequested: boolean;

    // This is used to track which component is currently blocking the auto-saving feature. If this is set to a string
    // value, auto-saving will be disabled, even if the autoSaving flag is set to true. This is useful when you want
    // to temporarily disable auto-saving, for example when clicking a CustomButton and waiting for the server to
    // respond. The server might read the data model, change it, and return changes back to the client, which could
    // cause data loss if we were to auto-save the data model while the server is still processing the request.
    lockedBy: string | undefined;

    // This is the url to use when saving the data model to the server. This can also be used to uniquely identify
    // the data model, so that we can save multiple data models to the server at the same time.
    saveUrl: string;
  };
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

export interface FDAppendToListUnique {
  path: string;
  newValue: any;
}

export interface FDAppendToList {
  path: string;
  newValue: any;
}

export interface FDRemoveIndexFromList {
  path: string;
  index: number;
}

export interface FDRemoveValueFromList {
  path: string;
  value: any;
}

export interface FormDataChangedFields {
  changedFields: IFormData | undefined;
}

export interface FormDataChangedModel {
  newModel: object;
}

export type FormDataChanges = FormDataChangedFields | FormDataChangedModel;

export interface FormDataMethods {
  // Methods used for updating the data model. These methods will update the currentData model, and after
  // the debounce() method is called, the debouncedCurrentData model will be updated as well.
  setLeafValue: (change: FDNewValue) => void;
  setMultiLeafValues: (changes: FDNewValues) => void;
  appendToListUnique: (change: FDAppendToListUnique) => void;
  appendToList: (change: FDAppendToList) => void;
  removeIndexFromList: (change: FDRemoveIndexFromList) => void;
  removeValueFromList: (change: FDRemoveValueFromList) => void;

  // Internal utility methods
  debounce: () => void;
  saveFinished: (savedData: object, changes: FormDataChanges) => void;
  requestManualSave: (setTo?: boolean) => void;
  lock: (lockName: string) => void;
  unlock: (newModel?: object) => void;
}

export type FormDataContext = FormDataState & FormDataMethods;

function makeActions(
  set: (fn: (state: FormDataContext) => void) => void,
  ruleConnections: IRuleConnections | null,
): FormDataMethods {
  function setDebounceTimeout(state: FormDataContext, change: FDChange) {
    state.controlState.debounceTimeout = change.debounceTimeout ?? DEFAULT_DEBOUNCE_TIMEOUT;
  }

  function processChanges(state: FormDataContext, changes: FormDataChanges | undefined) {
    if (
      changes &&
      'changedFields' in changes &&
      changes.changedFields &&
      Object.keys(changes.changedFields).length > 0
    ) {
      for (const path of Object.keys(changes.changedFields)) {
        const newValue = changes.changedFields[path];
        if (newValue === null) {
          continue; // TODO: Remove this when backend stops sending us null values that should be objects
        }

        // Currently, all data model values are saved as strings
        const newValueAsString = String(newValue);
        dot.str(path, newValueAsString, state.currentData);
        dot.str(path, newValueAsString, state.debouncedCurrentData);
        dot.str(path, newValueAsString, state.lastSavedData);
      }

      for (const model of [state.currentData, state.debouncedCurrentData, state.lastSavedData]) {
        const flatModel = flattenObject(model);
        const ruleResults = runLegacyRules(ruleConnections, flatModel, new Set(Object.keys(changes.changedFields)));
        for (const { path, newValue } of ruleResults) {
          dot.str(path, newValue, model);
        }
      }
    }
    if (changes && 'newModel' in changes) {
      // TODO: Do a deep diff with the last saved model, and only update the changed fields in the current and
      // debounced models.
      state.currentData = changes.newModel;
      state.debouncedCurrentData = changes.newModel;
      state.lastSavedData = changes.newModel;

      // TODO: Run rules on the new model
    }
  }

  function debounce(state: FormDataContext) {
    const currentDataFlat = flattenObject(state.currentData);
    const debouncedCurrentDataFlat = flattenObject(state.debouncedCurrentData);
    const diff = diffModels(currentDataFlat, debouncedCurrentDataFlat);
    const changes = runLegacyRules(ruleConnections, currentDataFlat, new Set(Object.keys(diff)));
    for (const { path, newValue } of changes) {
      dot.str(path, newValue, state.currentData);
    }

    state.debouncedCurrentData = state.currentData;
  }

  return {
    debounce: () =>
      set((state) => {
        debounce(state);
      }),

    saveFinished: (savedData, changes) =>
      set((state) => {
        state.lastSavedData = structuredClone(savedData);
        state.controlState.manualSaveRequested = false;
        processChanges(state, changes);
      }),
    setLeafValue: ({ path, newValue, ...rest }) =>
      set((state) => {
        const existingValue = dot.pick(path, state.currentData);
        if (existingValue === newValue) {
          return;
        }

        setDebounceTimeout(state, rest);
        if (newValue === '' || newValue === null || newValue === undefined) {
          dot.delete(path, state.currentData);
        } else {
          dot.str(path, String(newValue), state.currentData);
        }
      }),

    // All the list methods perform their work immediately, without debouncing, so that UI updates for new/removed
    // list items are immediate.
    appendToListUnique: ({ path, newValue }) =>
      set((state) => {
        for (const model of [state.currentData, state.debouncedCurrentData]) {
          const existingValue = dot.pick(path, model);
          if (Array.isArray(existingValue) && existingValue.includes(newValue)) {
            continue;
          }

          if (Array.isArray(existingValue)) {
            existingValue.push(newValue);
          } else {
            dot.str(path, [newValue], model);
          }
        }
      }),
    appendToList: ({ path, newValue }) =>
      set((state) => {
        for (const model of [state.currentData, state.debouncedCurrentData]) {
          const existingValue = dot.pick(path, model);
          if (Array.isArray(existingValue)) {
            existingValue.push(newValue);
          } else {
            dot.str(path, [newValue], model);
          }
        }
      }),
    removeIndexFromList: ({ path, index }) =>
      set((state) => {
        for (const model of [state.currentData, state.debouncedCurrentData]) {
          const existingValue = dot.pick(path, model);
          if (index >= existingValue.length) {
            continue;
          }

          existingValue.splice(index, 1);
        }
      }),
    removeValueFromList: ({ path, value }) =>
      set((state) => {
        for (const model of [state.currentData, state.debouncedCurrentData]) {
          const existingValue = dot.pick(path, model);
          if (!existingValue.includes(value)) {
            continue;
          }

          existingValue.splice(existingValue.indexOf(value), 1);
        }
      }),

    setMultiLeafValues: ({ changes, ...rest }) =>
      set((state) => {
        let changesFound = false;
        for (const { path, newValue } of changes) {
          const existingValue = dot.pick(path, state.currentData);
          if (existingValue === newValue) {
            continue;
          }
          if (newValue === '' || newValue === null || newValue === undefined) {
            dot.delete(path, state.currentData);
          } else {
            dot.str(path, String(newValue), state.currentData);
          }
          changesFound = true;
        }
        changesFound && setDebounceTimeout(state, rest);
      }),
    requestManualSave: (setTo = true) =>
      set((state) => {
        state.controlState.manualSaveRequested = setTo;
        debounce(state);
      }),
    lock: (lockName) =>
      set((state) => {
        state.controlState.lockedBy = lockName;
      }),
    unlock: (newModel) =>
      set((state) => {
        state.controlState.lockedBy = undefined;
        if (newModel) {
          processChanges(state, { newModel });
        }
      }),
  };
}

export const createFormDataWriteStore = (
  url: string,
  initialData: object,
  autoSaving: boolean,
  gatekeepers: FormDataWriteGatekeepers,
  ruleConnections: IRuleConnections | null,
) =>
  createStore<FormDataContext>()(
    immer((set) => {
      const actions = makeActions(set, ruleConnections);
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
        controlState: {
          autoSaving,
          manualSaveRequested: false,
          lockedBy: undefined,
          debounceTimeout: DEFAULT_DEBOUNCE_TIMEOUT,
          saveUrl: url,
        },
        ...actions,
      };
    }),
  );
