/**
 * IValidationObject is an intermediate format that contains the information necessary to build validations for the redux store.
 * It is the format returned by the frontend validation methods.
 */
export type IValidationObject = IValidationMessage<T> | IEmptyValidation;

/**
 * A single validation mesage generated by the frontend.
 */
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

/**
 * This should only be generated for a component when all of its validation methods have returned no errors.
 */
export type IEmptyValidation = {
  empty: true;
  pageKey: string;
  componentId: string;
  rowIndices: number[];
};

export type ValidationSeverity = 'errors' | 'warnings' | 'info' | 'success' | 'fixed' | 'unspecified';

/**
 * The 'Result' formats are returned to the redux reducers to update the state.
 */
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

/**
 * IValidations is the format used to store validation messages in redux.
 * Example:
 *
 * {                                              // IValidations
 *   "page-1": {                                  // ILayoutValidations
 *     "component-1": {                           // IComponentValidations
 *       "simpleBinding": {                       // IComponentBindingValidation
 *         "errors": ["errorMesssage1"],
 *         "warning": ["warning1", "warning2"],
 *       }
 *     }
 *   }
 * }
 */

export interface IValidations {
  [pageKey: string]: ILayoutValidations;
}

export interface ILayoutValidations {
  [componentId: string]: IComponentValidations;
}

export interface IComponentValidations {
  [bindingKey: string]: IComponentBindingValidation | undefined;
}

export type IComponentBindingValidation = {
  [severity in ValidationSeverity]?: string[];
};

export type ValidationKey = keyof IComponentBindingValidation;
export type ValidationKeyOrAny = ValidationKey | 'any';

/**
 * This format is used by the backend to send validation issues to the frontend.
 */
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
