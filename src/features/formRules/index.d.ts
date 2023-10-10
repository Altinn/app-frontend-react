export interface IRuleModelFieldElement {
  type: string;
  name: string;
  inputs: any;
}

export interface IFormRuleState {
  model: IRuleModelFieldElement[];
  fetching: boolean;
  fetched: boolean;
  fetchedForTaskId?: string;
  error: Error | null;
}

export interface IFetchRuleModelFulfilled {
  ruleModel: IRuleModelFieldElement[];
  taskId?: string;
}

export interface IFetchRuleModelRejected {
  error: Error | null;
}
