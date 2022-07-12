import type { SagaIterator } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';
import { QueueActions } from '../queueSlice';
import { ApplicationSettingsActions } from '../../applicationSettings/applicationSettingsSlice';
import { TextResourcesActions } from '../../textResources/textResourcesSlice';
import { LanguageActions } from '../../language/languageSlice';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { ApplicationMetadataActions } from 'src/shared/resources/applicationMetadata/applicationMetadataSlice';
import { OrgsActions } from '../../orgs/orgsSlice';

export function* startInitialAppTaskQueueSaga(): SagaIterator {
  yield put(ApplicationSettingsActions.fetchApplicationSettings());
  yield put(TextResourcesActions.fetch());
  yield put(LanguageActions.fetchLanguage());
  yield put(ApplicationMetadataActions.get());
  yield put(FormLayoutActions.fetchSets());
  yield put(OrgsActions.fetch());
  yield put(QueueActions.startInitialAppTaskQueueFulfilled());
}

export function* watchStartInitialAppTaskQueueSaga(): SagaIterator {
  yield take(QueueActions.startInitialAppTaskQueue);
  yield call(startInitialAppTaskQueueSaga);
}
