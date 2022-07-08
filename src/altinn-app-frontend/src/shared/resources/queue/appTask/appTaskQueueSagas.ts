import type { SagaIterator } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';
import {
  startInitialAppTaskQueue,
  startInitialAppTaskQueueFulfilled,
} from '../queueSlice';
import { ApplicationSettingsActions } from '../../applicationSettings/applicationSettingsSlice';
import TextResourcesActions from '../../textResources/textResourcesActions';
import { LanguageActions } from '../../language/languageSlice';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { ApplicationMetadataActions } from 'src/shared/resources/applicationMetadata/applicationMetadataSlice';
import { OrgsActions } from '../../orgs/orgsSlice';

export function* startInitialAppTaskQueueSaga(): SagaIterator {
  yield put(ApplicationSettingsActions.fetchApplicationSettings());
  yield call(TextResourcesActions.fetchTextResources);
  yield put(LanguageActions.fetchLanguage());
  yield put(ApplicationMetadataActions.get());
  yield put(FormLayoutActions.fetchLayoutSets());
  yield put(OrgsActions.fetch());
  yield put(startInitialAppTaskQueueFulfilled());
}

export function* watchStartInitialAppTaskQueueSaga(): SagaIterator {
  yield take(startInitialAppTaskQueue);
  yield call(startInitialAppTaskQueueSaga);
}
