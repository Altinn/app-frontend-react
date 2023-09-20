import { createSagaSlice } from 'src/redux/sagaSlice';
import type {
  IDataListData,
  IDataListsState,
  IFetchDataListsRejectedAction,
  ISetDataListsPageNumber,
  ISetDataListsPageSize,
  ISetDataListsWithIndexIndicators,
  ISetSort,
} from 'src/features/dataLists/index';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

const initialState: IDataListsState = {
  dataLists: {},
  dataListsWithIndexIndicator: [],
  error: null,
};

export let DataListsActions: ActionsFromSlice<typeof dataListsSlice>;
export const dataListsSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IDataListsState>) => ({
    name: 'dataListState',
    initialState,
    actions: {
      fetchRejected: mkAction<IFetchDataListsRejectedAction>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.error = error;
        },
      }),
      setDataListsWithIndexIndicators: mkAction<ISetDataListsWithIndexIndicators>({
        reducer: (state, action) => {
          const { dataListsWithIndexIndicators } = action.payload;
          state.dataListsWithIndexIndicator = dataListsWithIndexIndicators;
        },
      }),
      setPageSize: mkAction<ISetDataListsPageSize>({
        reducer: (state, action) => {
          const { key, size } = action.payload;
          state.dataLists[key].size = size;
          state.dataLists[key].pageNumber = 0;
        },
      }),
      setPageNumber: mkAction<ISetDataListsPageNumber>({
        reducer: (state, action) => {
          const { key, pageNumber } = action.payload;
          state.dataLists[key].pageNumber = pageNumber;
        },
      }),
      setSort: mkAction<ISetSort>({
        reducer: (state, action) => {
          const { key, sortColumn, sortDirection } = action.payload;
          state.dataLists[key].sortColumn = sortColumn;
          state.dataLists[key].sortDirection = sortDirection;
        },
      }),
      update: mkAction<IDataListData>({
        reducer: (state, action) => {
          const { key, paginationData, metaData, listItems } = action.payload;
          state.dataLists[key] = {
            ...(state.dataLists[key] || {}),
            ...metaData,
            id: key,
            listItems,
            paginationData,
          };
        },
      }),
    },
  }));

  DataListsActions = slice.actions;
  return slice;
};
