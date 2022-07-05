import type {
  Slice,
  CaseReducer,
  CaseReducerWithPrepare,
  PayloadAction,
} from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type SagaAction<Reducer> = {
  reducer?: Reducer;
};

type ActionsToReducers<State, Actions extends SagaActions<any>> = {
  [Type in keyof Actions]:
    | CaseReducer<State, PayloadAction<any>>
    | CaseReducerWithPrepare<State, PayloadAction<any, string, any, any>>;
};

export interface SagaActions<T> {
  [key: string]: SagaAction<T>;
}

export interface SagaOptions<
  State,
  Actions extends SagaActions<any>,
  Name extends string = string,
> {
  name: Name;
  initialState: State | (() => State);
  actions: Actions;
}

/**
 * Wrapper for createSlice() that makes it possible to set not just
 * reducers, but also reference the action saga handler. This should
 * make it possible to use 'find usages'/'go to definition' and
 * similar IDE functionality without jumping through hoops to find
 * the relevant saga for an action.
 */
export function createSagaSlice<
  State,
  Actions extends SagaActions<any>,
  Name extends string = string,
>(
  options: SagaOptions<State, Actions, Name>,
): Slice<State, ActionsToReducers<State, Actions>, Name> {
  return createSlice({
    name: options.name,
    initialState: options.initialState,
    reducers: Object.keys(options.actions).map((key) => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return options.actions[key].reducer || (() => {});
    }) as any,
  });
}
