import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest, select} from 'redux-saga/effects';
import { IProfile } from 'altinn-shared/types';
import { get } from '../../../../utils/networking';
import ProfileActions from '../profileActions';
import { IFetchProfile } from './fetchProfileActions';
import * as ProfileActionTypes from './fetchProfileActionTypes';
import { userTaskQueueError } from '../../queue/queueSlice';
import AppLanguagesActions from '../../appLanguage/appLanguagesActions';
import { IRuntimeState } from 'src/types';

const appLanguageState = (state: IRuntimeState) => state.appLanguages.selectedAppLanguage;

function* fetchProfileSaga({ url }: IFetchProfile): SagaIterator {

  try {
    const profile: IProfile = yield call(get, url);
    const appLanguage: string = yield select(appLanguageState);
    yield call(
      ProfileActions.fetchProfileFulfilled,
      profile,
    );
    if(!appLanguage) {
      yield call(AppLanguagesActions.updateAppLanguage, profile.profileSettingPreference.language);
    }
  } catch (error) {
    yield call(ProfileActions.fetchProfileRejected, error);
    yield put(userTaskQueueError({ error }));
  }
}

export function* watchFetchProfileSaga(): SagaIterator {
  yield takeLatest(ProfileActionTypes.FETCH_PROFILE, fetchProfileSaga);
}
