export interface IFetchServiceConfigFulfilled {
  apis: any;
  ruleConnection: any;
  conditionalRendering: any;
}

export interface IFetchServiceConfigRejected {
  error: Error;
}
