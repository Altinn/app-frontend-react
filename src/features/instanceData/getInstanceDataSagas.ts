import { call, put } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';

import { InstanceDataActions } from 'src/features/instanceData/instanceDataSlice';
import { maybeAuthenticationRedirect } from 'src/utils/maybeAuthenticationRedirect';
import { httpGet } from 'src/utils/network/networking';
import { instancesControllerUrl } from 'src/utils/urls/appUrlHelper';
import type { IGetInstanceData } from 'src/features/instanceData/index';

export function* getInstanceDataSaga({ payload: { instanceId } }: PayloadAction<IGetInstanceData>): SagaIterator {
  try {
    const url = `${instancesControllerUrl}/${instanceId}`;
    const result = yield call(httpGet, url);
    yield put(InstanceDataActions.getFulfilled({ instanceData: result }));
  } catch (error) {
    const wasRedirected = yield call(maybeAuthenticationRedirect, error);
    if (!wasRedirected) {
      yield put(InstanceDataActions.getRejected({ error }));
      window.logError('Fetching instance data failed:\n', error);
    }
  }
}
