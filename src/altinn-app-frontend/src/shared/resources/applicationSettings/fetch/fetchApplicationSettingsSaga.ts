import { call, put } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { ApplicationSettingsActions as Actions } from 'src/shared/resources/applicationSettings/applicationSettingsSlice';
import { applicationSettingsApiUrl } from 'src/utils/appUrlHelper';
import { get } from 'src/utils/networking';

export function* getApplicationSettings(): SagaIterator {
  try {
    const applicationSettings = yield call(get, applicationSettingsApiUrl);
    yield put(
      Actions.fetchApplicationSettingsFulfilled({
        settings: applicationSettings,
      }),
    );
  } catch (error) {
    yield put(Actions.fetchApplicationSettingsRejected({ error }));
  }
}
