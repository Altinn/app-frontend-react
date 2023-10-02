import { call, put, select } from 'redux-saga/effects';
import type { AxiosResponse } from 'axios';
import type { SagaIterator } from 'redux-saga';

import { InstanceDataActions } from 'src/features/instanceData/instanceDataSlice';
import { InstantiationActions } from 'src/features/instantiate/instantiation/instantiationSlice';
import { maybeAuthenticationRedirect } from 'src/utils/maybeAuthenticationRedirect';
import { httpPost } from 'src/utils/network/networking';
import { getCreateInstancesUrl } from 'src/utils/urls/appUrlHelper';
import type { IRuntimeState } from 'src/types';
import type { IParty } from 'src/types/shared';

const SelectedPartySelector = (state: IRuntimeState) => state.party.selectedParty;

export function* instantiationSaga(): SagaIterator {
  try {
    const selectedParty: IParty = yield select(SelectedPartySelector);

    // Creates a new instance
    let instanceResponse: AxiosResponse;
    try {
      instanceResponse = yield call(httpPost, getCreateInstancesUrl(selectedParty.partyId));
    } catch (error) {
      yield call(maybeAuthenticationRedirect, error);
      throw error;
    }

    yield put(
      InstanceDataActions.getFulfilled({
        instanceData: instanceResponse.data,
      }),
    );
    yield put(
      InstantiationActions.instantiateFulfilled({
        instanceId: instanceResponse.data.id,
      }),
    );
  } catch (error) {
    yield put(InstantiationActions.instantiateRejected({ error }));
    window.logError('Instantiation failed:\n', error);
  }
}
