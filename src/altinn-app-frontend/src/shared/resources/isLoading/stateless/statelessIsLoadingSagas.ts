import type { SagaIterator } from 'redux-saga';
import { take, all, put } from 'redux-saga/effects';
import { FormDataActions } from 'src/features/form/data/formDataSlice';
import { DataModelActions } from 'src/features/form/datamodel/datamodelSlice';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { QueueActions } from '../../queue/queueSlice';
import { IsLoadingActions } from '../isLoadingSlice';
import { FormDynamicsActions } from 'src/features/form/dynamics/formDynamicsSlice';
import { FormRulesActions } from 'src/features/form/rules/rulesSlice';

export function* watcherFinishStatelessIsLoadingSaga(): SagaIterator {
  yield take(QueueActions.startInitialStatelessQueue);
  yield all([
    take(FormDataActions.fetchFulfilled),
    take(FormLayoutActions.fetchFulfilled),
    take(FormLayoutActions.fetchSettingsFulfilled),
    take(DataModelActions.fetchJsonSchemaFulfilled),
    take(FormRulesActions.fetchFulfilled),
    take(FormDynamicsActions.fetchFulfilled),
  ]);
  yield put(IsLoadingActions.finishStatelessIsLoading());
}
