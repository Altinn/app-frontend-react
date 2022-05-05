import update from 'immutability-helper';
import { Action, Reducer } from 'redux';
import {
  IFetchAppLanguagesFulfilled,
  IFetchAppLanguagesRejected,
  IUpdateAppLanguages,
} from './fetch/fetchAppLanguagesActions';
import * as ActionTypes from './fetch/fetchAppLanguagesActionTypes';

import { IAltinnWindow } from 'src/types';
import { IAppLanguage } from 'altinn-shared/types';
const altinnWindow = window as Window as IAltinnWindow;
const { app } = altinnWindow;
const localStorageLanguageKey = `selectedAppLanguage${app}`;

export interface IAppLanguageState {
  resources: IAppLanguage[];
  error: Error;
  selectedAppLanguage: string;
}

const initialState: IAppLanguageState = {
  resources: [],
  error: null,
  selectedAppLanguage: localStorage.getItem(localStorageLanguageKey) || '',
};

const AppLanguageReducer: Reducer<IAppLanguageState> = (
  state: IAppLanguageState = initialState,
  action?: Action,
): IAppLanguageState => {
  if (!action) {
    return state;
  }

  switch (action.type) {
    case ActionTypes.FETCH_APP_LANGUAGES_FULFILLED: {
      const { resources } = action as IFetchAppLanguagesFulfilled;
      return update<IAppLanguageState>(state, {
        resources: {
          $set: resources,
        },
      });
    }
    case ActionTypes.FETCH_APP_LANGUAGES_REJECTED: {
      const { error } = action as IFetchAppLanguagesRejected;
      return update<IAppLanguageState>(state, {
        error: {
          $set: error,
        },
      });
    }
    case ActionTypes.UPDATE_SELECTED_APP_LANGUAGE: {
      const { language } = action as IUpdateAppLanguages;
      localStorage.setItem(localStorageLanguageKey, language);
      return update<IAppLanguageState>(state, {
        selectedAppLanguage: {
          $set: language,
        },
      });
    }

    default: {
      return state;
    }
  }
};

export default AppLanguageReducer;
