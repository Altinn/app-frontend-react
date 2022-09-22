import type { ProcessTaskType } from 'src/types';

export interface IProcessState {
  availableNextTasks?: string[];
  taskType: ProcessTaskType;
  error: Error;
  taskId: string;
}

export interface IGetTasksFulfilled {
  tasks: string[];
}

export interface ICompleteProcessFulfilled {
  processStep: ProcessTaskType;
  taskId: string;
}

export type IGetProcessStateFulfilled = ICompleteProcessFulfilled;
export type IGoToTaskFulfilled = ICompleteProcessFulfilled;

interface CommonRejected {
  error: Error;
}

export type ICompleteProcessRejected = CommonRejected;
export type IGetProcessStateRejected = CommonRejected;
export type IGoToTaskRejected = CommonRejected;
