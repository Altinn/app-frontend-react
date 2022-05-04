import { SagaIterator } from 'redux-saga';
import { all, call, put, take } from 'redux-saga/effects';
import { get } from '../../../../utils/networking';
import { appLanguagesUrl } from '../../../../utils/appUrlHelper';
import AppLanguagesActions from '../appLanguagesActions';
import { appTaskQueueError } from '../../queue/queueSlice';
import { FETCH_APP_LANGUAGES } from './fetchAppLanguagesActionTypes';

function* fetchAppLanguages(): SagaIterator {
  try {
    const resource = yield call(get, appLanguagesUrl())
    yield call(AppLanguagesActions.fetchAppLanguagesFulfilled, resource);
  } catch (error) {
    yield call(AppLanguagesActions.fetchAppLanguagesRejected, error);
    yield put(appTaskQueueError({ error }));
  }
}

export function* watchFetchAppLanguagesSaga(): SagaIterator {
  yield all([
    take(FETCH_APP_LANGUAGES),
  ]);
  yield call(fetchAppLanguages);
}
