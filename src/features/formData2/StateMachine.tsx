import dot from 'dot-object';
import { useImmerReducer } from 'use-immer';

import type { IFormData } from 'src/features/formData';

/**
 * TODO: Make sure the model is initialized. Queue up changes and apply them after if not.
 */

export interface FormDataStorage {
  currentUuid: string;
  currentData: object;
  currentDataFlat: IFormData;
  lastSavedData: object;
  lastSavedDataFlat: IFormData;
}

export interface DataModelChange {
  path: string;
  newValue: string;
}

export type FDAction = FDActionSetLeafValue | FDActionSetMultiLeafValues | FDActionInitialFetch | FDActionSaveFinished;
type FDActionTypes = FDAction['type'];
type FDActionObject<T extends FDActionTypes> = Extract<FDAction, { type: T }>;

type Implementation<T extends FDActionTypes> = (state: FormDataStorage, action: FDActionObject<T>) => void;

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
  currentDataFlat: {},
  lastSavedData: {},
  lastSavedDataFlat: {},
};

const actions: ImplementationMap = {
  initialFetch: (state, { data, uuid }) => {
    console.log('debug, initialFetchImpl', data);
    state.currentUuid = uuid;
    state.currentData = data;
    state.currentDataFlat = dot.dot(data);
    state.lastSavedData = data;
    state.lastSavedDataFlat = dot.dot(data);
  },
  saveFinished: (state, { savedData, changedFields }) => {
    // TODO: Implement changedFields
    console.log('debug, saveFinishedImpl', changedFields);
    state.lastSavedData = savedData;
    state.lastSavedDataFlat = dot.dot(savedData);
  },
  setLeafValue: (state, { path, newValue }) => {
    const existingValue = state.currentDataFlat[path];
    if (existingValue === newValue) {
      console.log('debug, setLeafValueImpl no-change', path, newValue);
      return;
    }

    dot.str(path, newValue, state.currentData);
    state.currentDataFlat = dot.dot(state.currentData);

    console.log('debug, setLeafValueImpl', path, { existingValue, newValue });
  },
  setMultiLeafValues: (state, { changes }) => {
    console.log('debug, setMultiLeafValuesImpl', changes);
    let changesMade = false;
    for (const { path, newValue } of changes) {
      const existingValue = state.currentDataFlat[path];
      if (existingValue === newValue) {
        continue;
      }
      dot.str(path, newValue, state.currentData);
      changesMade = true;
    }

    if (!changesMade) {
      state.currentDataFlat = dot.dot(state.currentData);
    }
  },
};

function reducer<T extends FDActionTypes>(state: FormDataStorage, action: FDActionObject<T>) {
  const implementation = actions[action.type];
  if (implementation) {
    (implementation as unknown as Implementation<T>)(state, action);
    return;
  }
  throw new Error(`Unknown action type ${action.type}`);
}

export const useFormDataStateMachine = () => useImmerReducer(reducer, initialState);
