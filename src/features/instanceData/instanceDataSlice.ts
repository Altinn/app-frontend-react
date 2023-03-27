import { getInstanceDataSaga } from 'src/features/instanceData/get/getInstanceDataSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type {
  IGetInstanceData,
  IGetInstanceDataFulfilled,
  IGetInstanceDataRejected,
  IInstanceDataState,
} from 'src/features/instanceData/index';
import type { MkActionType } from 'src/redux/sagaSlice';

const initialState: IInstanceDataState = {
  instance: null,
  error: null,
};

export const instanceDataSlice = createSagaSlice((mkAction: MkActionType<IInstanceDataState>) => ({
  name: 'instanceData',
  initialState,
  actions: {
    get: mkAction<IGetInstanceData>({
      takeLatest: getInstanceDataSaga,
    }),
    getFulfilled: mkAction<IGetInstanceDataFulfilled>({
      reducer: (state, action) => {
        state.instance = action.payload.instanceData;
      },
    }),
    getRejected: mkAction<IGetInstanceDataRejected>({
      reducer: (state, action) => {
        state.error = action.payload.error;
      },
    }),
  },
}));

export const InstanceDataActions = instanceDataSlice.actions;
