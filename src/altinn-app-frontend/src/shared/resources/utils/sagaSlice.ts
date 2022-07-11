import type {
  Slice,
  PayloadAction,
  CaseReducer,
  CreateSliceOptions,
} from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import type { WritableDraft } from 'immer/dist/types/types-external';
import { createSlice, createAction } from '@reduxjs/toolkit';
import { takeLatest, takeEvery } from 'redux-saga/effects';

type Saga = () => SagaIterator | any;
type PayloadSaga<Payload> = (
  action: PayloadAction<Payload>,
) => SagaIterator | any;

export interface SagaAction<Payload, State> {
  /**
   * Declare your action reducer here. If you don't have a reducer for a given action, omit this.
   */
  reducer?: (
    state: WritableDraft<State>,
    action: PayloadAction<Payload>,
  ) => any;

  /**
   * Declare any (or many) sagas tied to this action. These sagas will be registered automatically.
   */
  saga?: (actionName: string) => Saga | Saga[];

  /**
   * Spawns a saga on each action dispatched to the Store.
   */
  takeEvery?: PayloadSaga<Payload> | PayloadSaga<Payload>[];

  /**
   * Forks a saga on each action dispatched to the Store, and automatically cancels
   * any previous saga task started previously if it's still running.
   */
  takeLatest?: PayloadSaga<Payload> | PayloadSaga<Payload>[];
}

export type ExtractPayload<Action> = Action extends SagaAction<
  infer Payload,
  any
>
  ? Payload
  : never;

type TransformActions<State, Actions extends SagaActions<State>> = {
  [ActionKey in keyof Actions]: CaseReducer<
    State,
    PayloadAction<ExtractPayload<Actions[ActionKey]>>
  >;
};

export interface SagaActions<State> {
  [key: string]: SagaAction<any, State>;
}

export type SagaSliceProps<
  State = any,
  Actions extends SagaActions<State> = SagaActions<State>,
  Name extends string = string,
> = {
  name: Name;
  initialState: State | (() => State);
  actions: Actions;
  extraReducers?: CreateSliceOptions<
    State,
    TransformActions<State, Actions>,
    Name
  >['extraReducers'];
};

export type MkActionType<State> = <
  Payload = void,
  Out extends SagaAction<Payload, State> = SagaAction<Payload, State>,
>(
  action: Out,
) => Out;

export const rootSagas: Saga[] = [];

/**
 * Wrapper for createSlice() that makes it possible to set not just
 * reducers, but also reference the action saga handler. This should
 * make it possible to use 'find usages'/'go to definition' and
 * similar IDE functionality without jumping through hoops to find
 * the relevant saga for an action.
 */
export function createSagaSlice<
  State = any,
  Actions extends SagaActions<State> = SagaActions<State>,
  Name extends string = string,
>(
  // It is expected that you specify the type of mkAction explicitly to MkActionType<YourStateType>
  cb: (mkAction: never) => SagaSliceProps<State, Actions, Name>,
): Slice<State, TransformActions<State, Actions>, Name> {
  const mkAction: MkActionType<State> = (action) => action;
  const props = cb(mkAction as never);

  const reducers: any = {};
  const otherActions: any = {};

  for (const key of Object.keys(props.actions)) {
    const actionName = `${props.name}/${key}`;
    const action = props.actions[key];

    if ('reducer' in action) {
      reducers[key] = action.reducer;
    } else {
      otherActions[key] = createAction(actionName);
    }

    if ('saga' in action) {
      const saga = action.saga(actionName);
      const sagas = Array.isArray(saga) ? saga : [saga];
      rootSagas.push(...sagas);
    }

    if ('takeLatest' in action) {
      const targets = Array.isArray(action.takeLatest)
        ? action.takeLatest
        : [action.takeLatest];
      for (const target of targets) {
        rootSagas.push(function* (): SagaIterator {
          yield takeLatest(actionName, target);
        });
      }
    }

    if ('takeEvery' in action) {
      const targets = Array.isArray(action.takeEvery)
        ? action.takeEvery
        : [action.takeEvery];
      for (const target of targets) {
        rootSagas.push(function* (): SagaIterator {
          yield takeEvery(actionName, target);
        });
      }
    }
  }

  const slice = createSlice({
    name: props.name,
    initialState: props.initialState,
    reducers,
    extraReducers: props.extraReducers,
  });

  slice.actions = {
    ...slice.actions,
    ...otherActions,
  };

  return slice;
}
