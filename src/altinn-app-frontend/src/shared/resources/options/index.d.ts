import type {
  IAppList,
  IAppLists,
  IAppListsMetaData,
  IOption,
  IOptions,
  IOptionsMetaData,
} from 'src/types';

export interface IOptionsState {
  error: Error | null;
  options: IOptions;
  optionsWithIndexIndicators?: IOptionsMetaData[];
}
export interface IAppListsState {
  error: Error;
  appLists: IAppLists;
  appListsWithIndexIndicator?: IAppListsMetaData[];
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
