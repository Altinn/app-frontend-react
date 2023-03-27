import { getApplicationMetadata } from 'src/features/applicationMetadata/sagas/get';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type {
  IApplicationMetadataState,
  IGetApplicationMetadataFulfilled,
  IGetApplicationMetadataRejected,
} from 'src/features/applicationMetadata/index';
import type { MkActionType } from 'src/redux/sagaSlice';

const initialState: IApplicationMetadataState = {
  applicationMetadata: null,
  error: null,
};

export const applicationMetadataSlice = createSagaSlice((mkAction: MkActionType<IApplicationMetadataState>) => ({
  name: 'applicationMetadata',
  initialState,
  actions: {
    get: mkAction<void>({
      takeLatest: getApplicationMetadata,
    }),
    getFulfilled: mkAction<IGetApplicationMetadataFulfilled>({
      reducer: (state, action) => {
        state.applicationMetadata = action.payload.applicationMetadata;
        state.error = null;
      },
    }),
    getRejected: mkAction<IGetApplicationMetadataRejected>({
      reducer: (state, action) => {
        state.error = action.payload.error;
      },
    }),
  },
}));

export const ApplicationMetadataActions = applicationMetadataSlice.actions;
