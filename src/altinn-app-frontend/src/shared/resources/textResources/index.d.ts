import type { ITextResource } from 'src/types';

export interface ITextResourcesState {
  language: string;
  rtlLanguageDirection?: boolean;
  resources: ITextResource[];
  error: Error;
}

export interface IFetchTextResourcesFulfilled {
  languageDirection?: string;
  language: string;
  resources: ITextResource[];
}

export interface IFetchTextResourcesRejected {
  error: Error;
}

export interface IReplaceTextResourcesFulfilled {
  language: string;
  resources: ITextResource[];
}

export interface IReplaceTextResourcesRejected {
  error: Error;
}
