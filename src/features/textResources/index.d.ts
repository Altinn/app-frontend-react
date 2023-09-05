import type { ITextResource } from 'src/types';

export interface ITextResourcesState {
  language: string | null;
  resources: ITextResource[];
  error: Error | null;
}

export interface IFetchTextResourcesFulfilled {
  language: string;
  resources: ITextResource[];
}

export interface IFetchTextResourcesRejected {
  error: Error | null;
}
