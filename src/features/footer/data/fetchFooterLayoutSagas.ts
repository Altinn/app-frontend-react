import { call, put } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { FooterLayoutActions } from 'src/features/footer/data/footerLayoutSlice';
import { httpGet } from 'src/utils/network/networking';
import { getFooterLayoutUrl } from 'src/utils/urls/appUrlHelper';
import type { IFooterLayout } from 'src/features/footer/types';

export function* fetchFooterLayoutSaga(): SagaIterator {
  try {
    const footerLayout: IFooterLayout = yield call(httpGet, getFooterLayoutUrl());
    yield put(FooterLayoutActions.fetchFulfilled({ footerLayout }));
  } catch (error) {
    if (error?.response?.status === 404) {
      // We accept that the app does not have a layout sets as this is not default
      yield put(FooterLayoutActions.fetchFulfilled({ footerLayout: null }));
    } else {
      yield put(FooterLayoutActions.fetchRejected({ error }));
    }
  }
}
