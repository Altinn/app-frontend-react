import { call, put } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { ProcessActions } from 'src/shared/resources/process/processSlice';
import { getProcessNextUrl } from 'src/utils/appUrlHelper';

import { get } from 'altinn-shared/utils';
import type { IProcess } from 'altinn-shared/types';

export function* getTasksSaga(): SagaIterator {
  try {
    const result: IProcess = yield call(get, getProcessNextUrl(), null);
    if (!result) {
      put(
        ProcessActions.getTasksRejected({
          error: new Error('Error: no process returned.'),
        }),
      );
      return;
    }
    yield put(
      ProcessActions.getTasksFulfilled({
        tasks: result as unknown as string[],
      }),
    );
  } catch (error) {
    yield put(ProcessActions.getTasksRejected({ error }));
  }
}
