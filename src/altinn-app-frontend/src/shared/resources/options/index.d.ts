import type { SortDirection } from '@altinn/altinn-design-system';

import type {
  IDataLists,
  IDataLists,
  IDataListsMetaData,
  IDataListsMetaData,
  IOption,
  IOption,
  IOptions,
  IOptions,
  IOptionsMetaData,
  IOptionsMetaData,
} from 'src/types';

export interface IOptionsState {
  error: Error | null;
  options: IOptions;
  optionsWithIndexIndicators?: IOptionsMetaData[];
}
export interface IDataListsState {
  error: Error | null;
  dataLists: IDataLists;
  dataListsWithIndexIndicator?: IDataListsMetaData[];
}

export interface IFetchOptionsFulfilledAction {
  key: string;
  options: IOption[];
}
export interface IFetchDataListsFulfilledAction {
  key: string;
  dataLists: any;
  metadata: any;
}

export interface IFetchOptionsRejectedAction {
  key: string;
  error: Error;
}

export interface IFetchDataListsRejectedAction {
  key: string;
  error: Error;
}

export interface IFetchingOptionsAction {
  key: string;
  metaData: IOptionsMetaData;
}

export interface IFetchingDataListsAction {
  key: string;
  metaData: IOptionsMetaData;
}

export interface ISetOptionsWithIndexIndicators {
  optionsWithIndexIndicators: IOptionsMetaData[];
}

export interface ISetDataListsWithIndexIndicators {
  dataListsWithIndexIndicators: IDataListsMetaData[];
}

export interface ISetOptions {
  options: IOptions;
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
