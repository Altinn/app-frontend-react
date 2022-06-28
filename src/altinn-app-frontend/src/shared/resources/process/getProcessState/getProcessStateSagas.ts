import type { SagaIterator } from "redux-saga";
import { call, takeLatest } from "redux-saga/effects";
import { get } from "altinn-shared/utils";
import type { IProcess } from "altinn-shared/types";
import { ProcessTaskType } from "../../../../types";
import { getProcessStateUrl } from "../../../../utils/appUrlHelper";
import * as ProcessStateActionTypes from "../processActionTypes";
import ProcessStateDispatchers from "../processDispatcher";

export function* getProcessStateSaga(): SagaIterator {
  try {
    const processState: IProcess = yield call(get, getProcessStateUrl());
    if (!processState) {
      yield call(
        ProcessStateDispatchers.getProcessStateFulfilled,
        ProcessTaskType.Unknown,
        null
      );
    } else if (processState.ended) {
      yield call(
        ProcessStateDispatchers.getProcessStateFulfilled,
        ProcessTaskType.Archived,
        null
      );
    } else {
      yield call(
        ProcessStateDispatchers.getProcessStateFulfilled,
        processState.currentTask.altinnTaskType as ProcessTaskType,
        processState.currentTask.elementId
      );
    }
  } catch (err) {
    yield call(ProcessStateDispatchers.getProcessStateRejected, err);
  }
}

export function* watchGetProcessStateSaga(): SagaIterator {
  yield takeLatest(
    ProcessStateActionTypes.GET_PROCESS_STATE,
    getProcessStateSaga
  );
}
