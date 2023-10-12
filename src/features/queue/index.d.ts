export interface IQueueState {
  appTask: IQueueTask;
}

export interface IQueueTask {
  error: Error | null;
}

export interface IQueueError {
  error: Error;
}
