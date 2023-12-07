/* eslint-disable no-console */
import { useEffect } from 'react';

import dot from 'dot-object';
import deepEqual from 'fast-deep-equal';
import { original } from 'immer';
import { useImmerReducer } from 'use-immer';

import { diffModels } from 'src/features/formData/diffModels';
import { runLegacyRules } from 'src/features/formData/LegacyRules';
import { useAppSelector } from 'src/hooks/useAppSelector';
import type { IRuleConnections } from 'src/features/form/dynamics';
import type { IFormData } from 'src/features/formData/index';

export interface FormDataStorage {
  // These values contain the current data model, with the values immediately available whenever the user is typing.
  // Use these values to render the form, and for other cases where you need the current data model immediately.
  currentUuid: string;
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

export interface DataModelChange {
  path: string;
  newValue: string;
}

type FDActionTypes = FDAction['type'];
type FDActionObject<T extends FDActionTypes> = Extract<FDAction, { type: T }>;
type Implementation<T extends FDActionTypes> = (
  state: FormDataStorage,
  action: FDActionObject<T>,
  ruleConnections: IRuleConnections | null,
) => void;

type ImplementationMap = {
  [Key in FDActionTypes]: Implementation<Key>;
};

interface FDActionInitialFetch {
  type: 'initialFetch';
  data: object;
  uuid: string;
}

interface FDActionSaveFinished {
  type: 'saveFinished';
  savedData: object;
  changedFields?: IFormData;
}

interface FDActionSetLeafValue extends DataModelChange {
  type: 'setLeafValue';
}

interface FDActionAppendToListUnique extends DataModelChange {
  type: 'appendToListUnique';
}

interface FDActionRemoveIndexFromList {
  type: 'removeIndexFromList';
  path: string;
  index: number;
}

interface FDActionRemoveValueFromList {
  type: 'removeValueFromList';
  path: string;
  value: string;
}

interface FDActionSetMultiLeafValues {
  type: 'setMultiLeafValues';
  changes: DataModelChange[];
}

interface FDActionFreeze {
  type: 'freeze';
}

export type FDAction =
  | FDActionSetLeafValue
  | FDActionAppendToListUnique
  | FDActionRemoveIndexFromList
  | FDActionRemoveValueFromList
  | FDActionSetMultiLeafValues
  | FDActionInitialFetch
  | FDActionSaveFinished
  | FDActionFreeze;

export type FDActionExceptInitialFetch = Exclude<FDAction, FDActionInitialFetch>;

const actions: ImplementationMap = {
  initialFetch: (state, { data, uuid }) => {
    state.currentUuid = uuid;
    state.currentData = data;
    state.debouncedCurrentData = data;
    state.lastSavedData = data;
  },
  freeze: (state, _, _ruleConnections) => {
    const currentDataFlat = dot.dot(state.currentData);
    const debouncedCurrentDataFlat = dot.dot(state.debouncedCurrentData);
    const diff = diffModels(currentDataFlat, debouncedCurrentDataFlat);
    const changes = runLegacyRules(_ruleConnections, currentDataFlat, new Set(Object.keys(diff)));
    for (const { path, newValue } of changes) {
      dot.str(path, newValue, state.currentData);
    }

    state.debouncedCurrentData = state.currentData;
  },
  // TODO: Create tests for this action, it's getting complex
  saveFinished: (state, { savedData, changedFields }) => {
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
  },
  setLeafValue: (state, { path, newValue }) => {
    const existingValue = dot.pick(path, state.currentData);
    if (existingValue === newValue) {
      console.log('debug, setLeafValueImpl no-change', path, newValue);
      return;
    }

    dot.str(path, newValue, state.currentData);
    console.log('debug, setLeafValueImpl', path, newValue);
  },
  appendToListUnique: (state, { path, newValue }) => {
    const existingValue = dot.pick(path, state.currentData);
    if (existingValue.includes(newValue)) {
      console.log('debug, appendToListImpl no-change', path, newValue);
      return;
    }

    dot.str(path, [...existingValue, newValue], state.currentData);
    console.log('debug, appendToListImpl', path, newValue);
  },
  removeIndexFromList: (state, { path, index }) => {
    const existingValue = dot.pick(path, state.currentData);
    if (index >= existingValue.length) {
      console.log('debug, removeIndexFromListImpl no-change', path, index);
      return;
    }

    throw new Error('Not implemented');
  },
  removeValueFromList: (state, { path, value }) => {
    const existingValue = dot.pick(path, state.currentData);
    if (!existingValue.includes(value)) {
      console.log('debug, removeValueFromListImpl no-change', path, value);
      return;
    }

    throw new Error('Not implemented');
  },
  setMultiLeafValues: (state, { changes }) => {
    console.log('debug, setMultiLeafValuesImpl', changes);
    for (const { path, newValue } of changes) {
      const existingValue = dot.pick(path, state.currentData);
      if (existingValue === newValue) {
        continue;
      }
      dot.str(path, newValue, state.currentData);
    }
  },
};

type Reducer = <T extends FDActionTypes>(state: FormDataStorage, action: FDActionObject<T>) => void;

const createReducer =
  (ruleConnections: IRuleConnections | null): Reducer =>
  (state, action) => {
    const implementation = actions[action.type] as unknown as Implementation<FDActionTypes>;
    if (implementation) {
      console.log('debug, useFormDataStateMachine, action', action);
      return implementation(state, action, ruleConnections);
    }
    throw new Error(`Unknown action type ${action.type}`);
  };

// Defining one single object to be used as the initial state. This affects comparisons in useEffect(), etc, so that
// we don't interpret the initial state as a change (because currentData !== lastSavedData).
const initialEmptyObject = {};
const initialState: FormDataStorage = {
  currentUuid: '',
  currentData: initialEmptyObject,
  debouncedCurrentData: initialEmptyObject,
  lastSavedData: initialEmptyObject,
};

export const useFormDataStateMachine = (uuid: string, initialData: object) => {
  const ruleConnections = useAppSelector((state) => state.formDynamics.ruleConnection);
  const [state, dispatch] = useImmerReducer<FormDataStorage, FDAction>(createReducer(ruleConnections), initialState);

  useEffect(() => {
    dispatch({ type: 'initialFetch', data: initialData, uuid });
  }, [uuid, initialData, dispatch]);

  // Freeze the data model when the user stops typing. Freezing it has the effect of triggering a useEffect in
  // FormDataWriteProvider, which will save the data model to the server.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.currentData !== state.debouncedCurrentData) {
        dispatch({ type: 'freeze' });
      }
    }, 2000); // TODO: Make this configurable, per each component that makes changes

    return () => {
      clearTimeout(timer);
    };
  }, [dispatch, state.currentData, state.debouncedCurrentData]);

  useEffect(() => {
    console.log('debug, useFormDataStateMachine, state change', state);
  }, [state]);

  return [state, dispatch] as const;
};
