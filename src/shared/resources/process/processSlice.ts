import type { PayloadAction } from '@reduxjs/toolkit';
import type { WritableDraft } from 'immer/dist/types/types-external';

import { checkProcessUpdated } from 'src/shared/resources/process/checkProcessUpdated/checkProcessUpdatedSagas';
import { completeProcessSaga } from 'src/shared/resources/process/completeProcess/completeProcessSagas';
import { getProcessStateSaga } from 'src/shared/resources/process/getProcessState/getProcessStateSagas';
import { getTasksSaga } from 'src/shared/resources/process/getTasks/getTasksSagas';
import { createSagaSlice } from 'src/shared/resources/utils/sagaSlice';
import type {
  ICompleteProcess,
  ICompleteProcessFulfilled,
  ICompleteProcessRejected,
  IGetProcessStateFulfilled,
  IGetProcessStateRejected,
  IGetTasksFulfilled,
  IProcessState,
} from 'src/shared/resources/process';
import type { MkActionType } from 'src/shared/resources/utils/sagaSlice';

const initialState: IProcessState = {
  taskType: null,
  error: null,
  taskId: undefined,
  read: null,
  write: null,
  actions: null,
};

const genericFulfilledReducer = (
  state: WritableDraft<IProcessState>,
  action: PayloadAction<IGetProcessStateFulfilled>,
) => {
  const { taskType, taskId, read, write, actions } = action.payload;
  state.taskType = taskType;
  state.taskId = taskId;
  state.read = read;
  state.write = write;
  state.actions = actions;
  state.error = null;
};

export const processSlice = createSagaSlice((mkAction: MkActionType<IProcessState>) => ({
  name: 'process',
  initialState,
  actions: {
    getTasks: mkAction<IGetTasksFulfilled>({
      takeLatest: getTasksSaga,
    }),
    getTasksFulfilled: mkAction<IGetTasksFulfilled>({
      reducer: (state: WritableDraft<IProcessState>, action: PayloadAction<IGetTasksFulfilled>) => {
        state.availableNextTasks = action.payload.tasks;
        state.error = null;
      },
    }),
    getTasksRejected: mkAction<IGetProcessStateRejected>({
      reducer: (state, action) => {
        state.error = action.payload.error;
      },
    }),
    get: mkAction<void>({
      takeLatest: getProcessStateSaga,
    }),
    getFulfilled: mkAction<IGetProcessStateFulfilled>({
      takeLatest: getTasksSaga,
      reducer: genericFulfilledReducer,
    }),
    getRejected: mkAction<IGetProcessStateRejected>({
      reducer: (state, action) => {
        state.error = action.payload.error;
      },
    }),
    complete: mkAction<ICompleteProcess | undefined>({
      takeLatest: completeProcessSaga,
    }),
    completeFulfilled: mkAction<ICompleteProcessFulfilled>({
      takeLatest: getTasksSaga,
      reducer: genericFulfilledReducer,
    }),
    completeRejected: mkAction<ICompleteProcessRejected>({
      reducer: (state, action) => {
        state.error = action.payload.error;
      },
    }),
    checkIfUpdated: mkAction<void>({
      takeLatest: checkProcessUpdated,
    }),
  },
}));

export const ProcessActions = processSlice.actions;
