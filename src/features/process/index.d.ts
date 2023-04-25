import type { ProcessTaskType } from 'src/types';

export type IProcessState = {
  availableNextTasks?: string[];
  taskType: ProcessTaskType | null;
  error: Error | null;
  taskId: string | null | undefined;
} & IProcessPermissions;

export type IProcessPermissions = {
  read?: boolean | null;
  write?: boolean | null;
  actions?: IProcessActions | null;
};

export type IProcessAction = 'instantiate' | 'confirm' | 'sign' | 'reject'; // Is this necessary to specify? Is instantiate even a valid user action?
export type IProcessActions = {
  [k in IProcessAction]?: boolean;
};

export interface IGetTasksFulfilled {
  taskType?: ProcessTaskType;
  tasks?: string[];
  task?: string;
}

export type ICompleteProcess = {
  taskId?: string | null;
  action?: IProcessAction;
};

export type ICompleteProcessFulfilled = {
  taskId: string | null | undefined;
  taskType: ProcessTaskType;
} & IProcessPermissions;

export type IGetProcessStateFulfilled = ICompleteProcessFulfilled;

interface CommonRejected {
  error: Error;
}

export type ICompleteProcessRejected = CommonRejected;
export type IGetProcessStateRejected = CommonRejected;
