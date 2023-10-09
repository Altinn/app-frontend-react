import { all, put, take } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { FormDynamicsActions } from 'src/features/dynamics/formDynamicsSlice';
import { FormRulesActions } from 'src/features/formRules/rulesSlice';
import { IsLoadingActions } from 'src/features/isLoading/isLoadingSlice';
import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';
import { QueueActions } from 'src/features/queue/queueSlice';
import { waitFor } from 'src/utils/sagas';

export function* watcherFinishDataTaskIsLoadingSaga(): SagaIterator {
  while (true) {
    yield take(QueueActions.startInitialDataTaskQueue);
    yield all([
      take(FormLayoutActions.fetchFulfilled),
      take(FormLayoutActions.fetchSettingsFulfilled),
      take(FormRulesActions.fetchFulfilled),
      take(FormDynamicsActions.fetchFulfilled),
    ]);

    yield waitFor((state) => state.formData.pendingUrl === undefined);
    yield waitFor((state) => state.attachments.pendingMapping === false || state.attachments.error === undefined);

    yield put(IsLoadingActions.finishDataTaskIsLoading());
  }
}
