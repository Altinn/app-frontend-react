import { all, put, take } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { FormDataActions } from 'src/features/form/data/formDataSlice';
import { FormDynamicsActions } from 'src/features/form/dynamics/formDynamicsSlice';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { FormRulesActions } from 'src/features/form/rules/rulesSlice';
import { IsLoadingActions } from 'src/features/isLoading/isLoadingSlice';
import { QueueActions } from 'src/features/queue/queueSlice';

export function* watcherFinishDataTaskIsloadingSaga(): SagaIterator {
  while (true) {
    yield take(QueueActions.startInitialDataTaskQueue);
    yield all([
      take(FormDataActions.fetchFulfilled),
      take(FormLayoutActions.fetchFulfilled),
      take(FormLayoutActions.fetchSettingsFulfilled),
      take(FormRulesActions.fetchFulfilled),
      take(FormDynamicsActions.fetchFulfilled),
      take(AttachmentActions.mapAttachmentsFulfilled),
    ]);

    yield put(IsLoadingActions.finishDataTaskIsLoading());
  }
}
