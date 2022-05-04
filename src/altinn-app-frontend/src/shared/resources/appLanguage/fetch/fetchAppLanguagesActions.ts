import { Action } from 'redux';
import * as ActionTypes from './fetchAppLanguagesActionTypes';

export interface IFetchAppLanguagesFulfilled extends Action {
  resources: string[];
}

export interface IUpdateAppLanguages extends Action {
  language: string;
}

export interface IFetchAppLanguagesRejected extends Action {
  error: Error;
}

export function fetchAppLanguages(): Action {
  return {
    type: ActionTypes.FETCH_APP_LANGUAGES,
  };
}

export function fetchAppLanguagesFulfilled(resources: string[]): IFetchAppLanguagesFulfilled {
  return {
    type: ActionTypes.FETCH_APP_LANGUAGES_FULFILLED,
    resources,
  };
}

export function updateAppLanguage(language: string): IUpdateAppLanguages {
  return {
    type: ActionTypes.UPDATE_SELECTED_APP_LANGUAGE,
    language,
  };
}

export function fetchAppLanguagesRejected(error: Error): IFetchAppLanguagesRejected {
  return {
    type: ActionTypes.FETCH_APP_LANGUAGES_REJECTED,
    error,
  };
}