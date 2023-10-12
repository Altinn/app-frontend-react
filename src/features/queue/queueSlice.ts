import { put } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { TextResourcesActions } from 'src/features/textResources/textResourcesSlice';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type { IQueueError, IQueueState } from 'src/features/queue/index';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

export const initialState: IQueueState = {
  appTask: { error: null },
};

export let QueueActions: ActionsFromSlice<typeof queueSlice>;
export const queueSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IQueueState>) => ({
    name: 'queue',
    initialState,
    actions: {
      appTaskQueueError: mkAction<IQueueError>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.appTask.error = error;
        },
      }),
      startInitialAppTaskQueue: mkAction<void>({
        *takeEvery(): SagaIterator {
          yield put(TextResourcesActions.fetch());
        },
      }),
    },
  }));

  QueueActions = slice.actions;
  return slice;
};
