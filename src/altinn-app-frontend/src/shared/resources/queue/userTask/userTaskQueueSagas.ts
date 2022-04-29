import { SagaIterator } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';
import { startInitialUserTaskQueue, startInitialUserTaskQueueFulfilled } from '../queueSlice';
import ProfileActions from '../../profile/profileActions';
import PartyActions from '../../party/partyActions';
import OrgsActions from 'src/shared/resources/orgs/orgsActions';
import { profileApiUrl } from 'src/utils/appUrlHelper';

export function* startInitialUserTaskQueueSaga(): SagaIterator {
  yield call(ProfileActions.fetchProfile, profileApiUrl);
  yield call(PartyActions.getCurrentParty);
  yield call(OrgsActions.fetchOrgs);
  yield put(startInitialUserTaskQueueFulfilled());
}

export function* watchStartInitialUserTaskQueueSaga(): SagaIterator {
  yield take(startInitialUserTaskQueue);
  yield call(startInitialUserTaskQueueSaga);
}
