import { SagaIterator } from 'redux-saga';
import { call, select, takeLatest } from 'redux-saga/effects';
import { get } from 'src/utils/networking';
import { appLanguagesUrl } from 'src/utils/appUrlHelper';
import AppLanguagesActions from '../appLanguagesActions';
import { IRuntimeState } from 'src/types';
import { FormLayoutActions as Actions } from 'src/features/form/layout/formLayoutSlice';

function* fetchAppLanguages(): SagaIterator {
  try {
    const showLanguageSelector = yield select(
      (state: IRuntimeState) => state.formLayout.uiConfig.showLanguageSelector,
    );
    if (showLanguageSelector) {
      const resource = yield call(get, appLanguagesUrl());
      yield call(AppLanguagesActions.fetchAppLanguagesFulfilled, resource);
    }
  } catch (error) {
    yield call(AppLanguagesActions.fetchAppLanguagesRejected, error);
  }
}

export function* watchFetchAppLanguagesSaga(): SagaIterator {
  yield takeLatest(Actions.fetchLayoutSettingsFulfilled, fetchAppLanguages);
}
