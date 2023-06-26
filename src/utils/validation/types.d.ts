export type IValidationObject = IValidationMessage<T> | IEmptyValidation;

export type IValidationMessage<T extends ValidationSeverity> = {
  empty: false;
  pageKey: string;
  componentId: string;
  bindingKey: string;
  severity: T;
  message: string;
  invalidDataTypes: boolean;
  rowIndices: number[];
};

export type IEmptyValidation = {
  empty: true;
  pageKey: string;
  componentId: string;
  rowIndices: number[];
};

export type ValidationSeverity = 'errors' | 'warnings' | 'info' | 'success' | 'fixed' | 'unspecified';

export type IComponentBindingValidation = {
  [severity in ValidationSeverity]?: string[];
};

export type ValidationKey = keyof IComponentBindingValidation;
export type ValidationKeyOrAny = ValidationKey | 'any';

export interface IValidationResult {
  invalidDataTypes?: boolean;
  validations: IValidations;
  fixedValidations?: IValidationMessage<'fixed'>[];
}

export interface ILayoutValidationResult {
  invalidDataTypes?: boolean;
  validations: ILayoutValidations;
  fixedValidations?: IValidationMessage<'fixed'>[];
}

export interface IComponentValidationResult {
  invalidDataTypes?: boolean;
  validations: IComponentValidations;
  fixedValidations?: IValidationMessage<'fixed'>[];
}

export interface IValidations {
  [id: string]: ILayoutValidations;
}

export interface ILayoutValidations {
  [id: string]: IComponentValidations;
}

export interface IComponentValidations {
  [id: string]: IComponentBindingValidation | undefined;
}

export interface IValidationIssue {
  code: string;
  description: string;
  field: string;
  scope: string | null;
  severity: ValidationIssueSeverity;
  targetId: string;
  source?: string;
  customTextKey?: string;
}
