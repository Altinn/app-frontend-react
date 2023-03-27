import { fetchOrgsSaga } from 'src/features/orgs/fetch/fetchOrgsSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type { IFetchOrgsFulfilled, IFetchOrgsRejected, IOrgsState } from 'src/features/orgs/index';
import type { MkActionType } from 'src/redux/sagaSlice';

const initialState: IOrgsState = {
  allOrgs: null,
  error: null,
};

export const orgsSlice = createSagaSlice((mkAction: MkActionType<IOrgsState>) => ({
  name: 'organisationMetaData',
  initialState,
  actions: {
    fetch: mkAction<void>({
      takeLatest: fetchOrgsSaga,
    }),
    fetchFulfilled: mkAction<IFetchOrgsFulfilled>({
      reducer: (state, action) => {
        state.allOrgs = action.payload.orgs;
      },
    }),
    fetchRejected: mkAction<IFetchOrgsRejected>({
      reducer: (state, action) => {
        state.error = action.payload.error;
      },
    }),
  },
}));

export const OrgsActions = orgsSlice.actions;
