import type {
  Slice,
  CaseReducer,
  CaseReducerWithPrepare,
  PayloadAction,
  ValidateSliceCaseReducers,
} from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import type { WritableDraft } from 'immer/dist/types/types-external';

type Saga = () => SagaIterator;
export type SagaAction<T, State> = {
  /**
   * Declare your action reducer here. If you don't have a reducer for a given action, omit this.
   */
  reducer?: (state: WritableDraft<State>, action: PayloadAction<T>) => any;

  /**
   * Declare any (or many) sagas tied to this action.
   */
  saga?: Saga | Saga[];
};

type ActionsToReducers<State, Actions extends SagaActions<State>> = {
  [Type in keyof Actions]:
    | CaseReducer<State, PayloadAction<any>>
    | CaseReducerWithPrepare<State, PayloadAction<any, string, any, any>>;
};

export interface SagaActions<State> {
  [key: string]: SagaAction<any, State>;
}

export const rootSagas: Saga[] = [];

/**
 * Wrapper for createSlice() that makes it possible to set not just
 * reducers, but also reference the action saga handler. This should
 * make it possible to use 'find usages'/'go to definition' and
 * similar IDE functionality without jumping through hoops to find
 * the relevant saga for an action.
 */
export function createSagaSlice<
  State,
  Actions extends SagaActions<State>,
  Name extends string = string,
>(
  props: {
    name: Name;
    initialState: State | (() => State);
  },
  cb: (
    mkAction: <ActionType, S = State>(
      action: SagaAction<ActionType, S>,
    ) => SagaAction<ActionType, S>,
  ) => Actions,
): Slice<State, ActionsToReducers<State, Actions>, Name> {
  const actions = cb((action) => action);

  const anyReducers: any = {};
  for (const key of Object.keys(actions)) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    anyReducers[key] = actions[key].reducer || (() => {});

    if (actions[key].saga) {
      if (Array.isArray(actions[key].saga)) {
        rootSagas.push(...(actions[key].saga as Saga[]));
      } else {
        rootSagas.push(actions[key].saga as Saga);
      }
    }
  }

  const reducers: ValidateSliceCaseReducers<
    State,
    ActionsToReducers<State, Actions>
  > = anyReducers;

  return createSlice({
    name: props.name,
    initialState: props.initialState,
    reducers,
  });
}
