import { Action, ActionCreatorsMapObject, bindActionCreators } from 'redux';
import * as FetchActions from './fetch/fetchAppLanguagesActions';

import { store } from '../../../store';

export interface IAppLanguagesActions extends ActionCreatorsMapObject {
  fetchAppLanguages: () => Action;
  fetchAppLanguagesFulfilled:
    (resources: string[]) => FetchActions.IFetchAppLanguagesFulfilled;
  fetchAppLanguagesRejected: (error: Error) => FetchActions.IFetchAppLanguagesRejected;
  updateAppLanguage: (language: string) => FetchActions.IUpdateAppLanguages;
}

const actions: IAppLanguagesActions = {
  fetchAppLanguages: FetchActions.fetchAppLanguages,
  fetchAppLanguagesFulfilled: FetchActions.fetchAppLanguagesFulfilled,
  updateAppLanguage: FetchActions.updateAppLanguage,
  fetchAppLanguagesRejected: FetchActions.fetchAppLanguagesRejected,
};

const AppLanguagesActions = bindActionCreators(actions, store.dispatch);

export default AppLanguagesActions;
