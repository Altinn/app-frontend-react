import type { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';
import {
  watchFetchFormLayoutSaga,
  watchFetchFormLayoutSettingsSaga,
} from './fetch/fetchFormLayoutSagas';
import {
  watchUpdateCurrentViewSaga,
  watchInitialCalculagePageOrderAndMoveToNextPageSaga,
  watchInitRepeatingGroupsSaga,
  watchMapFileUploaderWithTagSaga,
} from './update/updateFormLayoutSagas';

// eslint-disable-next-line func-names
export default function* (): SagaIterator {
  yield fork(watchFetchFormLayoutSaga);
  yield fork(watchInitRepeatingGroupsSaga);
  yield fork(watchMapFileUploaderWithTagSaga);
  yield fork(watchFetchFormLayoutSettingsSaga);
  yield fork(watchUpdateCurrentViewSaga);
  yield fork(watchInitialCalculagePageOrderAndMoveToNextPageSaga);
}
