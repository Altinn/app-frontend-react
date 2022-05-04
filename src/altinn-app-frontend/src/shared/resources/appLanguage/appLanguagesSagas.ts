import { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { watchFetchAppLanguagesSaga } from './fetch/fetchAppLanguagesSagas';

export default function* appLanguagesSagas(): SagaIterator {
  yield fork(watchFetchAppLanguagesSaga);
}