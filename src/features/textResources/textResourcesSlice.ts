import { watchFetchTextResourcesSaga } from 'src/features/textResources/fetch/fetchTextResourcesSagas';
import {
  replaceTextResourcesSaga,
  watchReplaceTextResourcesSaga,
} from 'src/features/textResources/replace/replaceTextResourcesSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type {
  IFetchTextResourcesFulfilled,
  IFetchTextResourcesRejected,
  IReplaceTextResourcesFulfilled,
  IReplaceTextResourcesRejected,
  ITextResourcesState,
} from 'src/features/textResources/index';
import type { MkActionType } from 'src/redux/sagaSlice';

const initialState: ITextResourcesState = {
  language: null,
  resources: [],
  error: null,
};

export const textResourcesSlice = createSagaSlice((mkAction: MkActionType<ITextResourcesState>) => ({
  name: 'textResources',
  initialState,
  actions: {
    fetch: mkAction<void>({
      saga: () => watchFetchTextResourcesSaga,
    }),
    fetchFulfilled: mkAction<IFetchTextResourcesFulfilled>({
      reducer: (state, action) => {
        state.language = action.payload.language;
        state.resources = action.payload.resources;
      },
    }),
    fetchRejected: mkAction<IFetchTextResourcesRejected>({
      reducer: (state, action) => {
        state.error = action.payload.error;
      },
    }),
    replace: mkAction<void>({
      takeLatest: replaceTextResourcesSaga,
      saga: () => watchReplaceTextResourcesSaga,
    }),
    replaceFulfilled: mkAction<IReplaceTextResourcesFulfilled>({
      reducer: (state, action) => {
        state.language = action.payload.language;
        state.resources = action.payload.resources;
      },
    }),
    replaceRejected: mkAction<IReplaceTextResourcesRejected>({
      reducer: (state, action) => {
        state.error = action.payload.error;
      },
    }),
  },
}));

export const TextResourcesActions = textResourcesSlice.actions;
