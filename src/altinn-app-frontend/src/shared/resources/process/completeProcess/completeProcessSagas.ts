import type { SagaIterator } from 'redux-saga';
import { call, put as sagaPut, select, takeLatest } from 'redux-saga/effects';
import { put } from 'altinn-shared/utils';
import type { IProcess } from 'altinn-shared/types';
import type { IRuntimeState } from '../../../../types';
import { ProcessTaskType } from '../../../../types';
import { getCompleteProcessUrl } from '../../../../utils/appUrlHelper';
import * as ProcessStateActionTypes from '../processActionTypes';
import ProcessDispatcher from '../processDispatcher';
import { startDataTaskIsLoading } from '../../isLoading/isLoadingSlice';
import { InstanceDataActions } from 'src/shared/resources/instanceData/instanceDataSlice';
import type { IInstanceDataState } from 'src/shared/resources/instanceData';

const instanceDataSelector = (state: IRuntimeState) => state.instanceData;

export function* completeProcessSaga(): SagaIterator {
  try {
    const result: IProcess = yield call(put, getCompleteProcessUrl(), null);
    if (!result) {
      throw new Error('Error: no process returned.');
    }
    if (result.ended) {
      yield call(
        ProcessDispatcher.completeProcessFulfilled,
        ProcessTaskType.Archived,
        null,
      );
    } else {
      yield call(
        ProcessDispatcher.completeProcessFulfilled,
        result.currentTask.altinnTaskType as ProcessTaskType,
        result.currentTask.elementId,
      );
      if (
        (result.currentTask.altinnTaskType as ProcessTaskType) ===
        ProcessTaskType.Data
      ) {
        yield sagaPut(startDataTaskIsLoading());
        const instanceData: IInstanceDataState = yield select(
          instanceDataSelector,
        );
        const [instanceOwner, instanceId] = instanceData.instance.id.split('/');
        yield sagaPut(InstanceDataActions.get({ instanceOwner, instanceId }));
      }
    }
  } catch (err) {
    yield call(ProcessDispatcher.completeProcessRejected, err);
  }
}

export function* watchCompleteProcessSaga(): SagaIterator {
  yield takeLatest(
    ProcessStateActionTypes.COMPLETE_PROCESS,
    completeProcessSaga,
  );
}
