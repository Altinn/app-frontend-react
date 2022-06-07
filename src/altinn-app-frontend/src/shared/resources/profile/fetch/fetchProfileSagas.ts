import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest, select} from 'redux-saga/effects';
import { IProfile } from 'altinn-shared/types';
import { get } from 'src/utils/networking';
import ProfileActions from '../profileActions';
import { IFetchProfile } from './fetchProfileActions';
import * as ProfileActionTypes from './fetchProfileActionTypes';
import { userTaskQueueError } from '../../queue/queueSlice';
import { LanguageActions } from 'src/shared/resources/language/languageSlice';
import { selectedAppLanguageState } from 'src/selectors/simpleSelectors';

function* fetchProfileSaga({ url }: IFetchProfile): SagaIterator {

  try {
    const profile: IProfile = yield call(get, url);
    const appLanguage: string = yield select(selectedAppLanguageState);
    yield call(
      ProfileActions.fetchProfileFulfilled,
      profile,
    );
    if(!appLanguage) {
      yield put(LanguageActions.updateSelectedAppLanguage({selected:profile.profileSettingPreference.language}))
    }
  } catch (error) {
    yield call(ProfileActions.fetchProfileRejected, error);
    yield put(userTaskQueueError({ error }));
  }
}

export function* watchFetchProfileSaga(): SagaIterator {
  yield takeLatest(ProfileActionTypes.FETCH_PROFILE, fetchProfileSaga);
}
