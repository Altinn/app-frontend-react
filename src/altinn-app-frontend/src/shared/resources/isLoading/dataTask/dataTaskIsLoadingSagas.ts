import type { SagaIterator } from 'redux-saga';
import { all, put, take } from 'redux-saga/effects';
import FormDataActions from '../../../../features/form/data/formDataActions';
import { FormLayoutActions } from '../../../../features/form/layout/formLayoutSlice';
import { FETCH_RULE_MODEL_FULFILLED } from '../../../../features/form/rules/rulesActionTypes';
import { finishDataTaskIsLoading } from '../isLoadingSlice';
import { startInitialDataTaskQueue } from '../../queue/queueSlice';
import { AttachmentActions } from 'src/shared/resources/attachments/attachmentSlice';
import { FormDynamicsActions } from 'src/features/form/dynamics/formDynamicsSlice';

export function* watcherFinishDataTaskIsloadingSaga(): SagaIterator {
  while (true) {
    yield take(startInitialDataTaskQueue);
    yield all([
      take(FormDataActions.fetchFormDataFulfilled),
      take(FormLayoutActions.fetchLayoutFulfilled),
      take(FormLayoutActions.fetchLayoutSettingsFulfilled),
      take(FETCH_RULE_MODEL_FULFILLED),
      take(FormDynamicsActions.fetchFormDynamicsFulfilled),
      take(AttachmentActions.mapAttachmentsFulfilled),
    ]);

    yield put(finishDataTaskIsLoading());
  }
}
