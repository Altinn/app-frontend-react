import { watchFetchTextResourcesSaga } from 'src/features/textResources/fetch/fetchTextResourcesSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type {
  IFetchTextResourcesFulfilled,
  IFetchTextResourcesRejected,
  ITextResourcesState,
} from 'src/features/textResources/index';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

const initialState: ITextResourcesState = {
  language: null,
  resources: [],
  error: null,
};

export let TextResourcesActions: ActionsFromSlice<typeof textResourcesSlice>;
export const textResourcesSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<ITextResourcesState>) => ({
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
    },
  }));

  TextResourcesActions = slice.actions;
  return slice;
};
