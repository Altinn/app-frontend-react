import type { ProcessTaskType } from 'src/types';

export type IProcessState = {
  availableNextTasks?: string[];
  taskType: ProcessTaskType | null;
  error: Error | null;
  taskId: string | null | undefined;
} & IProcessPermissions;

export type IProcessPermissions = {
  read: boolean | null;
  write: boolean | null;
  actions: IProcessActions;
};

export type IProcessAction = 'instantiate' | 'confirm' | 'sign' | 'reject';
export type IProcessActions = {
  [k in IProcessAction]: boolean | null;
};

export interface IGetTasksFulfilled {
  processStep?: ProcessTaskType;
  tasks?: string[];
  task?: string;
}

export type ICompleteProcess = {
  processStep: ProcessTaskType;
  taskId: string | null | undefined;
};

export type ICompleteProcessFulfilled = ICompleteProcess & IProcessPermissions;

export type IGetProcessStateFulfilled = ICompleteProcessFulfilled;

interface CommonRejected {
  error: Error;
}

export type ICompleteProcessRejected = CommonRejected;
export type IGetProcessStateRejected = CommonRejected;
