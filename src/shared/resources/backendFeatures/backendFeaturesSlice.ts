import { call, put } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { createSagaSlice } from 'src/shared/resources/utils/sagaSlice';
import { get } from 'src/utils/network/sharedNetworking';
import { getFeatureSetUrl } from 'src/utils/urls/appUrlHelper';
import type { IBackendFeaturesState } from 'src/shared/resources/backendFeatures/index';
import type { MkActionType } from 'src/shared/resources/utils/sagaSlice';

export const initialState: IBackendFeaturesState = {
  multiPartSave: false,
};

export const backendFeaturesSlice = createSagaSlice((mkAction: MkActionType<IBackendFeaturesState>) => ({
  name: 'backendFeatures',
  initialState,
  actions: {
    fetch: mkAction<void>({
      takeLatest: function* (): SagaIterator {
        try {
          const featureSet: IBackendFeaturesState = yield call(get, getFeatureSetUrl());
          yield put(BackendFeaturesActions.fetchFulfilled(featureSet));
        } catch (error) {
          yield put(BackendFeaturesActions.fetchRejected({ error: error instanceof Error ? error.message : '' }));
        }
      },
    }),
    fetchFulfilled: mkAction<IBackendFeaturesState>({
      reducer: (state, { payload }) => {
        for (const key of Object.keys(state)) {
          if (key in payload && typeof payload[key] === 'boolean') {
            state[key] = payload[key];
          }
        }
      },
    }),
    fetchRejected: mkAction<{ error: string }>({
      // Do nothing. Not having a feature-set just means you start out with the default known set of features
    }),
  },
}));

export const BackendFeaturesActions = backendFeaturesSlice.actions;
