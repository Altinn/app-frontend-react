import type { SortDirection } from '@altinn/altinn-design-system';

import type { IDataLists, IDataListsMetaData } from 'src/types';

export interface IDataListsState {
  error: Error | null;
  dataLists: IDataLists;
  dataListsWithIndexIndicator?: IDataListsMetaData[];
}

export interface IFetchDataListsFulfilledAction {
  key: string;
  dataLists: any;
  metadata: any;
}

export interface IFetchDataListsRejectedAction {
  key: string;
  error: Error;
}

export interface IFetchingDataListsAction {
  key: string;
  metaData: IOptionsMetaData;
}

export interface ISetDataListsWithIndexIndicators {
  dataListsWithIndexIndicators: IDataListsMetaData[];
}

export interface ISetDataLists {
  dataLists: IDataLists;
}

export interface ISetDataListsPageSize {
  key: string;
  size: number;
}

export interface ISetDataListsPageNumber {
  key: string;
  pageNumber: number;
}

export interface ISetSort {
  key: string;
  sortColumn: string;
  sortDirection: SortDirection;
}
