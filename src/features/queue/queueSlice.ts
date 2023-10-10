import { put } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';
import { watchStartInitialInfoTaskQueueSaga } from 'src/features/queue/infoTask/infoTaskQueueSaga';
import { TextResourcesActions } from 'src/features/textResources/textResourcesSlice';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type { IQueueError, IQueueState } from 'src/features/queue/index';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

export const initialState: IQueueState = {
  dataTask: { error: null },
  appTask: { error: null },
  userTask: { error: null },
  infoTask: { error: null },
  stateless: { error: null, working: false },
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
      userTaskQueueError: mkAction<IQueueError>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.userTask.error = error;
        },
      }),
      dataTaskQueueError: mkAction<IQueueError>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.dataTask.error = error;
        },
      }),
      startInitialAppTaskQueue: mkAction<void>({
        *takeEvery(): SagaIterator {
          yield put(TextResourcesActions.fetch());
        },
      }),
      startInitialDataTaskQueue: mkAction<void>({
        *takeEvery(): SagaIterator {
          yield put(FormLayoutActions.fetch());
          yield put(FormLayoutActions.fetchSettings());
          yield put(AttachmentActions.mapAttachments());
        },
      }),
      startInitialInfoTaskQueue: mkAction<void>({
        saga: () => watchStartInitialInfoTaskQueueSaga,
      }),
      startInitialStatelessQueue: mkAction<void>({
        *takeEvery(): SagaIterator {
          yield put(FormLayoutActions.fetch());
          yield put(FormLayoutActions.fetchSettings());
        },
        reducer: (state) => {
          state.stateless.working = true;
        },
      }),
      finishInitialStatelessQueue: mkAction<void>({
        reducer: (state) => {
          state.stateless.working = false;
        },
      }),
    },
  }));

  QueueActions = slice.actions;
  return slice;
};
