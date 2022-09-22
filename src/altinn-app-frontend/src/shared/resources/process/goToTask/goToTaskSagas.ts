import { call, put } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';

import { ProcessActions } from 'src/shared/resources/process/processSlice';
import { ProcessTaskType } from 'src/types';
import { getProcessNextUrl } from 'src/utils/appUrlHelper';
import type { IGoToTaskFulfilled } from 'src/shared/resources/process';

import { put as httpPut } from 'altinn-shared/utils';
import type { IProcess } from 'altinn-shared/types';

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
    console.log(taskId, result);
    put(
      ProcessActions.goToTaskFulfilled({
        taskId,
        processStep: ProcessTaskType.Data,
      }),
    );
  } catch (error) {
    yield put(ProcessActions.goToTaskRejected({ error }));
  }
}
