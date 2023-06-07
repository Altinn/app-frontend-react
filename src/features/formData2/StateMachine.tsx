import { useReducer } from 'react';

import dot from 'dot-object';

import type { IFormData } from 'src/features/formData';

/**
 * TODO: Make sure the model is initialized. Queue up changes and apply them after if not.
 * TODO: Store both the flat and the full model, since most of the time we need read from the flat model.
 */

export interface FormDataStorage {
  currentUuid: string;
  currentData: object;
  lastSavedData: object;
}

export interface DataModelChange {
  path: string;
  newValue: string;
}

export type FDAction = FDActionSetLeafValue | FDActionSetMultiLeafValues | FDActionInitialFetch | FDActionSaveFinished;
type FDActionTypes = FDAction['type'];
type FDActionObject<T extends FDActionTypes> = Extract<FDAction, { type: T }>;

type Implementation<T extends FDActionTypes> = (state: FormDataStorage, action: FDActionObject<T>) => FormDataStorage;

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

interface FDActionSetMultiLeafValues {
  type: 'setMultiLeafValues';
  changes: DataModelChange[];
}

const initialState: FormDataStorage = {
  currentUuid: '',
  currentData: {},
  lastSavedData: {},
};

const actions: ImplementationMap = {
  initialFetch: (state, { data, uuid }) => {
    console.log('debug, initialFetchImpl', data);
    return {
      ...state,
      currentUuid: uuid,
      currentData: data,
      lastSavedData: data,
    };
  },
  saveFinished: (state, { savedData, changedFields }) => {
    // TODO: Implement changedFields
    console.log('debug, saveFinishedImpl', changedFields);
    return {
      ...state,
      lastSavedData: savedData,
      saving: false,
    };
  },
  setLeafValue: (state, { path, newValue }) => {
    const existingValue = dot.pick(path, state);
    if (existingValue === newValue) {
      console.log('debug, setLeafValueImpl no-change', path, newValue);
      return state;
    }

    const newModel = JSON.parse(JSON.stringify(state.currentData));
    dot.str(path, newValue, newModel);

    const valueAfter = dot.pick(path, newModel);
    console.log('debug, setLeafValueImpl', path, { existingValue, newValue, valueAfter, newModel });

    return { ...state, currentData: newModel };
  },
  setMultiLeafValues: (state, { changes }) => {
    const newModel = structuredClone(state.currentData);
    // TODO: Check for no-change
    console.log('debug, setMultiLeafValuesImpl', changes);
    for (const change of changes) {
      dot.str(change.path, change.newValue, newModel);
    }

    return { ...state, currentData: newModel };
  },
};

function reducer<T extends FDActionTypes>(state: FormDataStorage, action: FDActionObject<T>) {
  const implementation = actions[action.type];
  if (implementation) {
    return (implementation as unknown as Implementation<T>)(state, action);
  }
  throw new Error(`Unknown action type ${action.type}`);
}

export function useFormDataStateMachine() {
  return useReducer(reducer, initialState);
}
