import { SagaIterator } from 'redux-saga';
import { call, put, all, take, select } from 'redux-saga/effects';

import type { IProfile } from 'altinn-shared/types';
import type { IRuntimeState } from '../../../../types';

import { getLanguageFromCode } from 'altinn-shared/language';
import LanguageActions from '../languageActions';
import * as LanguageActionTypes from './fetchLanguageActionTypes';
import * as ProfileActionTypes from '../../profile/fetch/fetchProfileActionTypes';
import { appTaskQueueError } from '../../queue/queueSlice';
import { makeGetAllowAnonymousSelector } from 'src/selectors/getAllowAnonymous';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { FETCH_APPLICATION_METADATA_FULFILLED } from '../../applicationMetadata/actions/types';

const profileState = (state: IRuntimeState): IProfile => state.profile.profile;

export function* fetchLanguageSaga(): SagaIterator {
  try {
    let languageCode = 'nb';
    const allowAnonymousSelector = makeGetAllowAnonymousSelector();
    const allowAnonymous = yield select(allowAnonymousSelector);
    if (!allowAnonymous) {
      const profile: IProfile = yield select(profileState);
      languageCode = profile.profileSettingPreference.language;
    }
    const language = getLanguageFromCode(languageCode);

    yield call(LanguageActions.fetchLanguageFulfilled, language);
  } catch (error) {
    yield call(LanguageActions.fetchLanguageRejected, error);
    yield put(appTaskQueueError({ error }));
  }
}

export function* watchFetchLanguageSaga(): SagaIterator {
  yield all([
    take(FormLayoutActions.fetchLayoutSetsFulfilled),
    take(FETCH_APPLICATION_METADATA_FULFILLED),
    take(LanguageActionTypes.FETCH_LANGUAGE),
  ]);

  const allowAnonymousSelector = makeGetAllowAnonymousSelector();
  const allowAnonymous = yield select(allowAnonymousSelector);

  if (!allowAnonymous) {
    yield take(ProfileActionTypes.FETCH_PROFILE_FULFILLED);
  }

  yield call(fetchLanguageSaga);
}
