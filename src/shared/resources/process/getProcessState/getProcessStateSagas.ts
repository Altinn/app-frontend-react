import { call, put, select } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { ProcessActions } from 'src/shared/resources/process/processSlice';
import { ProcessTaskType } from 'src/types';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { getProcessStateUrl } from 'src/utils/urls/appUrlHelper';
import type { IProcessPermissions } from 'src/shared/resources/process/index.d';
import type { IRuntimeState } from 'src/types';
import type { IProcess } from 'src/types/shared';

export function* getPermissionsFromProcess(process: IProcess) {
  const actionPermissions = yield select(
    (state: IRuntimeState) => state.applicationMetadata.applicationMetadata?.features?.actionPermissions,
  );
  if (actionPermissions) {
    return {
      read: process.currentTask?.read,
      write: process.currentTask?.write,
      actions: process.currentTask?.actions,
    } as IProcessPermissions;
  } else {
    // Return all true if feature is not available
    return {
      read: true,
      write: true,
      actions: {
        instantiate: true,
        confirm: true,
        sign: true,
        reject: true,
      },
    } as IProcessPermissions;
  }
}

export function* getProcessStateSaga(): SagaIterator {
  try {
    const processState: IProcess = yield call(httpGet, getProcessStateUrl());
    const permissions: IProcessPermissions = yield call(getPermissionsFromProcess, processState);
    if (!processState) {
      yield put(
        ProcessActions.getFulfilled({
          processStep: ProcessTaskType.Unknown,
          taskId: null,
          ...permissions,
        }),
      );
    } else if (processState.ended) {
      yield put(
        ProcessActions.getFulfilled({
          processStep: ProcessTaskType.Archived,
          taskId: null,
          ...permissions,
        }),
      );
    } else {
      yield put(
        ProcessActions.getFulfilled({
          processStep: processState.currentTask?.altinnTaskType as ProcessTaskType,
          taskId: processState.currentTask?.elementId || null,
          ...permissions,
        }),
      );
    }
  } catch (error) {
    yield put(ProcessActions.getRejected({ error }));
  }
}
