import { call, put, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';

import { InstanceDataActions } from 'src/shared/resources/instanceData/instanceDataSlice';
import { ProcessActions } from 'src/shared/resources/process/processSlice';
import { ProcessTaskType } from 'src/types';
import { getProcessNextUrl } from 'src/utils/appUrlHelper';
import type { IInstanceDataState } from 'src/shared/resources/instanceData';
import type { IGoToTaskFulfilled } from 'src/shared/resources/process';
import type { IRuntimeState } from 'src/types';

import { put as httpPut } from 'altinn-shared/utils';
import type { IProcess } from 'altinn-shared/types';

const instanceDataSelector = (state: IRuntimeState) => state.instanceData;

export function* goToTaskSaga({
  payload: { taskId },
}: PayloadAction<IGoToTaskFulfilled>): SagaIterator {
  try {
    const result: IProcess = yield call(
      httpPut,
      getProcessNextUrl(taskId),
      null,
    );
    if (!result) {
      put(
        ProcessActions.goToTaskRejected({
          error: new Error('Error: no process returned.'),
        }),
      );
      return;
    }
    yield put(
      ProcessActions.goToTaskFulfilled({
        taskId,
        processStep: ProcessTaskType.Data,
      }),
    );
    yield put(ProcessActions.getTasks());
    const instanceData: IInstanceDataState = yield select(instanceDataSelector);
    const instanceId = instanceData.instance.id;
    yield put(InstanceDataActions.get({ instanceId }));
  } catch (error) {
    yield put(ProcessActions.goToTaskRejected({ error }));
  }
}
