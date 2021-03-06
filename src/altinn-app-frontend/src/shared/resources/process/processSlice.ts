import type { PayloadAction } from '@reduxjs/toolkit';
import type { WritableDraft } from 'immer/dist/types/types-external';

import { checkProcessUpdated } from 'src/shared/resources/process/checkProcessUpdated/checkProcessUpdatedSagas';
import { completeProcessSaga } from 'src/shared/resources/process/completeProcess/completeProcessSagas';
import { getProcessStateSaga } from 'src/shared/resources/process/getProcessState/getProcessStateSagas';
import { createSagaSlice } from 'src/shared/resources/utils/sagaSlice';
import type {
  ICompleteProcessFulfilled,
  ICompleteProcessRejected,
  IGetProcessStateFulfilled,
  IGetProcessStateRejected,
  IProcessState,
} from 'src/shared/resources/process';
import type { MkActionType } from 'src/shared/resources/utils/sagaSlice';

const initialState: IProcessState = {
  taskType: null,
  error: null,
  taskId: undefined,
};

const genericFulfilledReducer = (
  state: WritableDraft<IProcessState>,
  action: PayloadAction<IGetProcessStateFulfilled>,
) => {
  state.taskType = action.payload.processStep;
  state.taskId = action.payload.taskId;
  state.error = null;
};

const processSlice = createSagaSlice(
  (mkAction: MkActionType<IProcessState>) => ({
    name: 'process',
    initialState,
    actions: {
      get: mkAction<void>({
        takeLatest: getProcessStateSaga,
      }),
      getFulfilled: mkAction<IGetProcessStateFulfilled>({
        reducer: genericFulfilledReducer,
      }),
      getRejected: mkAction<IGetProcessStateRejected>({
        reducer: (state, action) => {
          state.error = action.payload.error;
        },
      }),
      complete: mkAction<void>({
        takeLatest: completeProcessSaga,
      }),
      completeFulfilled: mkAction<ICompleteProcessFulfilled>({
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
  }),
);

export const ProcessActions = processSlice.actions;
export default processSlice;
