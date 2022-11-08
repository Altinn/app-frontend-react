import type { SortDirection } from '@altinn/altinn-design-system';

import type { IAppList, IAppLists, IAppListsMetaData, IOption, IOptions, IOptionsMetaData } from 'src/types';

export interface IOptionsState {
  error: Error | null;
  options: IOptions;
  optionsWithIndexIndicators?: IOptionsMetaData[];
}
export interface IAppListsState {
  error: Error | null;
  appLists: IAppLists;
  appListsWithIndexIndicator?: IAppListsMetaData[];
  sortColumn?: string;
  sortDirection?: SortDirection;
}

export interface IFetchOptionsFulfilledAction {
  key: string;
  options: IOption[];
}
export interface IFetchAppListsFulfilledAction {
  key: string;
  appLists: IAppList[];
}

export interface IFetchOptionsRejectedAction {
  key: string;
  error: Error;
}

export interface IFetchAppListsRejectedAction {
  key: string;
  error: Error;
}

export interface IFetchingOptionsAction {
  key: string;
  metaData: IOptionsMetaData;
}

export interface IFetchingAppListsAction {
  key: string;
  metaData: IOptionsMetaData;
}

export interface ISetOptionsWithIndexIndicators {
  optionsWithIndexIndicators: IOptionsMetaData[];
}

export interface ISetAppListsWithIndexIndicators {
  appListsWithIndexIndicators: IAppListsMetaData[];
}

export interface ISetOptions {
  options: IOptions;
}
export interface ISetAppLists {
  appLists: IAppLists;
}

export interface ISetSort {
  sortColumn: string;
  sortDirection: SortDirection;
}
