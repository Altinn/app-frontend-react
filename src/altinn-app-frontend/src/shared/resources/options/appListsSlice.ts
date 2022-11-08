import { SortDirection } from '@altinn/altinn-design-system';

import { fetchAppListsSaga } from 'src/shared/resources/options/fetch/fetchAppListsSaga';
import { createSagaSlice } from 'src/shared/resources/utils/sagaSlice';
import type {
  IAppListsState,
  IFetchAppListsFulfilledAction,
  IFetchAppListsRejectedAction,
  IFetchingAppListsAction,
  ISetAppLists,
  ISetAppListsWithIndexIndicators,
  ISetSort,
} from 'src/shared/resources/options';
import type { MkActionType } from 'src/shared/resources/utils/sagaSlice';

const initialState: IAppListsState = {
  appLists: {},
  appListsWithIndexIndicator: [],
  error: null,
  sortColumn: '',
  sortDirection: SortDirection.NotSortable,
};

const appListsSlice = createSagaSlice((mkAction: MkActionType<IAppListsState>) => ({
  name: 'appListState',
  initialState,
  actions: {
    fetch: mkAction<void>({
      takeEvery: fetchAppListsSaga,
    }),
    fetchFulfilled: mkAction<IFetchAppListsFulfilledAction>({
      reducer: (state, action) => {
        const { key, appLists } = action.payload;
        state.appLists[key].loading = false;
        state.appLists[key].appLists = appLists;
      },
    }),
    fetchRejected: mkAction<IFetchAppListsRejectedAction>({
      reducer: (state, action) => {
        const { key, error } = action.payload;
        state.appLists[key].loading = false;
        state.error = error;
      },
    }),
    fetching: mkAction<IFetchingAppListsAction>({
      reducer: (state, action) => {
        const { key, metaData } = action.payload;
        state.appLists[key] = {
          ...(state.appLists[key] || {}),
          ...metaData,
          loading: true,
        };
      },
    }),
    setAppListsWithIndexIndicators: mkAction<ISetAppListsWithIndexIndicators>({
      reducer: (state, action) => {
        const { appListsWithIndexIndicators } = action.payload;
        state.appListsWithIndexIndicator = appListsWithIndexIndicators;
      },
    }),
    setAppList: mkAction<ISetAppLists>({
      reducer: (state, action) => {
        const { appLists } = action.payload;
        state.appLists = appLists;
      },
    }),
    setSort: mkAction<ISetSort>({
      takeLatest: fetchAppListsSaga,
      reducer: (state, action) => {
        const { sortColumn, sortDirection } = action.payload;
        state.sortColumn = sortColumn;
        state.sortDirection = sortDirection;
      },
    }),
  },
}));

export const appListsActions = appListsSlice.actions;
export default appListsSlice;
