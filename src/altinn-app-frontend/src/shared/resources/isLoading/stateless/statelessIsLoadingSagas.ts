import type { SagaIterator } from 'redux-saga';
import { take, all, put } from 'redux-saga/effects';
import FormDataActions from 'src/features/form/data/formDataActions';
import { fetchJsonSchemaFulfilled } from 'src/features/form/datamodel/datamodelSlice';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { FETCH_RULE_MODEL_FULFILLED } from 'src/features/form/rules/rulesActionTypes';
import { startInitialStatelessQueue } from '../../queue/queueSlice';
import { finishStatelessIsLoading } from '../isLoadingSlice';
import { FormDynamicsActions } from 'src/features/form/dynamics/formDynamicsSlice';

export function* watcherFinishStatelessIsLoadingSaga(): SagaIterator {
  yield take(startInitialStatelessQueue);
  yield all([
    take(FormDataActions.fetchFormDataFulfilled),
    take(FormLayoutActions.fetchLayoutFulfilled),
    take(FormLayoutActions.fetchLayoutSettingsFulfilled),
    take(fetchJsonSchemaFulfilled),
    take(FETCH_RULE_MODEL_FULFILLED),
    take(FormDynamicsActions.fetchFormDynamicsFulfilled),
  ]);
  yield put(finishStatelessIsLoading());
}
