export interface IInstantiationState {
  instantiating: boolean;
  instanceId: string;
  error: Error;
}

export interface IInstantiate {
  org: string;
  app: string;
}

export interface IInstantiateFulfilled {
  instanceId: string;
}

export interface IInstantiateRejected {
  error: Error;
}
