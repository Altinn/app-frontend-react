import { useCallback, useEffect, useMemo, useRef } from 'react';

import dot from 'dot-object';
import { useImmerReducer } from 'use-immer';

import { useAppSelector } from 'src/hooks/useAppSelector';
import type { IRuleConnections } from 'src/features/dynamics';
import type { IFormData } from 'src/features/formData';

export interface FormDataStorage {
  // These values contain the current data model, with the values immediately available whenever the user is typing.
  // Use these values to render the form, and for other cases where you need the current data model immediately.
  currentUuid: string;
  currentData: object;
  currentDataFlat: IFormData;

  // These values contain the current data model, with the values debounced at 400ms. This means that if the user is
  // typing, the values will be updated 400ms after the user stopped typing. Use these values when you need to perform
  // expensive operations on the data model, such as validation, calculations, or sending a request to save the model.
  debouncedCurrentData: object;
  debouncedCurrentDataFlat: IFormData;

  // These values contain the last saved data model, with the values that were last saved to the server. We use this
  // to determine if there are any unsaved changes, and to diff the current data model against the last saved data
  // model when saving. You probably don't need to use these values directly unless you know what you're doing.
  lastSavedData: object;
  lastSavedDataFlat: IFormData;
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

interface FDActionSetMultiLeafValues {
  type: 'setMultiLeafValues';
  changes: DataModelChange[];
}

interface FDActionFreeze {
  type: 'freeze';
}

export type FDAction =
  | FDActionSetLeafValue
  | FDActionSetMultiLeafValues
  | FDActionInitialFetch
  | FDActionSaveFinished
  | FDActionFreeze;

// Defining one single object to be used as the initial state. This affects comparisons in useEffect(), etc, so that
// we don't interpret the initial state as a change (because currentData !== lastSavedData).
const initialEmptyObject = {};
const initialState: FormDataStorage = {
  currentUuid: '',
  currentData: initialEmptyObject,
  currentDataFlat: initialEmptyObject,
  debouncedCurrentData: initialEmptyObject,
  debouncedCurrentDataFlat: initialEmptyObject,
  lastSavedData: initialEmptyObject,
  lastSavedDataFlat: initialEmptyObject,
};

const actions: ImplementationMap = {
  initialFetch: (state, { data, uuid }) => {
    console.log('debug, initialFetchImpl', data);
    state.currentUuid = uuid;
    state.currentData = data;
    state.currentDataFlat = dot.dot(data);
    state.debouncedCurrentData = data;
    state.debouncedCurrentDataFlat = state.currentDataFlat;
    state.lastSavedData = data;
    state.lastSavedDataFlat = state.currentDataFlat;
  },
  freeze: (state, _, _ruleConnections) => {
    console.log('debug, freezeImpl');
    // TODO: Run rules
    state.debouncedCurrentData = state.currentData;
    state.debouncedCurrentDataFlat = state.currentDataFlat;
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

    if (changesMade) {
      state.currentDataFlat = dot.dot(state.currentData);
    }
  },
};

type Reducer = <T extends FDActionTypes>(state: FormDataStorage, action: FDActionObject<T>) => void;

const createReducer =
  (ruleConnections: IRuleConnections | null): Reducer =>
  (state, action) => {
    const implementation = actions[action.type];
    if (implementation) {
      return (implementation as unknown as Implementation<any>)(state, action, ruleConnections);
    }
    throw new Error(`Unknown action type ${action.type}`);
  };

export const useFormDataStateMachine = () => {
  const ruleConnections = useAppSelector((state) => state.formDynamics.ruleConnection);
  const [state, dispatch] = useImmerReducer<FormDataStorage, FDAction>(createReducer(ruleConnections), initialState);
  const actionQueue = useRef<FDAction[]>([]);

  // Wrap the dispatch function so that we can queue up actions to be dispatched once the initial fetch has completed
  const dispatchWrapper = useCallback(
    (action: FDAction) => {
      if (!state.currentUuid && action.type !== 'initialFetch') {
        console.log('debug, initial fetch not complete, queueing action', action);
        actionQueue.current.push(action);
        return;
      }

      dispatch(action);
    },
    [dispatch, state.currentUuid],
  );

  // Dispatch any queued actions once the initial fetch has completed
  useEffect(() => {
    if (state.currentUuid && actionQueue.current.length > 0) {
      console.log('debug, dispatching queued actions', actionQueue.current);
      for (const action of actionQueue.current) {
        dispatch(action);
      }
      actionQueue.current = [];
    }
  }, [dispatch, state.currentUuid]);

  // Freeze the data model when the user stops typing. Freezing it has the effect of triggering a useEffect in
  // FormDataContext, which will save the data model to the server.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.currentData !== state.debouncedCurrentData) {
        dispatch({ type: 'freeze' });
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [dispatch, state.currentData, state.debouncedCurrentData]);

  useMemo(() => {
    console.log('debug, useFormDataStateMachine, state change');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return [state, dispatchWrapper] as const;
};
