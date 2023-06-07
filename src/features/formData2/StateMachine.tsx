import { useCallback, useMemo } from 'react';

import dot from 'dot-object';
import { useImmerReducer } from 'use-immer';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { useDebounceDeepEqual } from 'src/hooks/useDebounceDeepEqual';
import type { IRuleConnections } from 'src/features/dynamics';
import type { IFormData } from 'src/features/formData';

/**
 * TODO: Make sure the model is initialized. Queue up changes and apply them after if not.
 */

interface FormDataStorageInternal {
  // These values contain the current data model, with the values immediately available whenever the user is typing.
  // Use these values to render the form, and for other cases where you need the current data model immediately.
  currentUuid: string;
  currentData: object;
  currentDataFlat: IFormData;

  // These values contain the last saved data model, with the values that were last saved to the server. We use this
  // to determine if there are any unsaved changes, and to diff the current data model against the last saved data
  // model when saving. You probably don't need to use these values directly unless you know what you're doing.
  lastSavedData: object;
  lastSavedDataFlat: IFormData;
}

export interface FormDataStorage extends FormDataStorageInternal {
  // These values contain the current data model, with the values debounced at 400ms. This means that if the user is
  // typing, the values will be updated 400ms after the user stopped typing. Use these values when you need to perform
  // expensive operations on the data model, such as validation, calculations, or sending a request to save the model.
  debouncedCurrentData: object;
  debouncedCurrentDataFlat: IFormData;
}

export interface DataModelChange {
  path: string;
  newValue: string;
}

type FDActionTypes = FDAction['type'];
type FDActionObject<T extends FDActionTypes> = Extract<FDAction, { type: T }>;
type Implementation<T extends FDActionTypes> = (
  state: FormDataStorageInternal,
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

interface FDActionRunRules {
  type: 'runRules';
}

export type FDAction =
  | FDActionSetLeafValue
  | FDActionSetMultiLeafValues
  | FDActionInitialFetch
  | FDActionSaveFinished
  | FDActionRunRules;

const initialState: FormDataStorageInternal = {
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
  runRules: (_state, _, _ruleConnections) => {
    console.log('debug, runRulesImpl');
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

type Reducer = <T extends FDActionTypes>(state: FormDataStorageInternal, action: FDActionObject<T>) => void;

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
  const [internalState, dispatch] = useImmerReducer<FormDataStorageInternal, FDAction>(
    createReducer(ruleConnections),
    initialState,
  );
  const onDebounceCallback = useCallback(() => {
    dispatch({ type: 'runRules' });
  }, [dispatch]);
  const [debouncedCurrentData, debouncedCurrentDataFlat] = useDebounceDeepEqual(
    [internalState.currentData, internalState.currentDataFlat],
    400,
    onDebounceCallback,
  );

  const externalState: FormDataStorage = useMemo(
    () => ({
      ...internalState,
      debouncedCurrentData,
      debouncedCurrentDataFlat,
    }),
    [internalState, debouncedCurrentData, debouncedCurrentDataFlat],
  );

  useMemo(() => {
    console.log('debug, useFormDataStateMachine, state change debounced');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCurrentData]);

  useMemo(() => {
    console.log('debug, useFormDataStateMachine, state change external');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalState]);

  useMemo(() => {
    console.log('debug, useFormDataStateMachine, state change internal');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalState]);

  return [externalState, dispatch] as const;
};
