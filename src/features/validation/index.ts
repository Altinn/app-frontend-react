import type Ajv from 'ajv';

import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IAttachments } from 'src/features/attachments';
import type { IJsonSchemas } from 'src/features/datamodel';
import type { Expression, ExprValToActual } from 'src/features/expressions/types';
import type { IFormData } from 'src/features/formData';
import type { IUseLanguage, ValidParam } from 'src/hooks/useLanguage';
import type { ILayoutSets } from 'src/types';
import type { IInstance, IProcess } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export enum FrontendValidationSource {
  EmptyField = '__empty_field__',
  Schema = '__schema__',
  Component = '__component__',
  Expression = '__expression__',
}

// TODO(Validation): Clean up this type and change it to:
// export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';
export type ValidationSeverity = 'errors' | 'warnings' | 'info' | 'success' | 'fixed' | 'unspecified';

export enum ValidationIssueSources {
  File = 'File',
  ModelState = 'ModelState',
  Required = 'Required',
  Expression = 'Expression',
  Custom = 'Custom',
}

export enum BackendValidationSeverity {
  Unspecified = 0,
  Error = 1,
  Warning = 2,
  Informational = 3,
  Fixed = 4,
  Success = 5,
}

export type ValidationContext = {
  state: ValidationState;
};

export type ValidationState = FormValidations & {
  task: BaseValidation[];
};

export type FormValidations = {
  fields: FieldValidations;
  components: ComponentValidations;
};

export type ValidationGroup<T extends GroupedValidation> = {
  [group: string]: T[];
};

export type FieldValidations = {
  [field: string]: ValidationGroup<FieldValidation>;
};

export type ComponentValidations = {
  [componentId: string]: {
    bindingKeys: { [bindingKey: string]: ValidationGroup<ComponentValidation> };
    component: ValidationGroup<ComponentValidation>;
  };
};

export type BaseValidation<Severity extends ValidationSeverity = ValidationSeverity> = {
  message: string;
  severity: Severity;
};

export type GroupedValidation<Severity extends ValidationSeverity = ValidationSeverity> = BaseValidation<Severity> & {
  group: string;
};

export type FieldValidation<Severity extends ValidationSeverity = ValidationSeverity> = GroupedValidation<Severity> & {
  field: string;
};

export type ComponentValidation<Severity extends ValidationSeverity = ValidationSeverity> =
  GroupedValidation<Severity> & {
    componentId: string;
    bindingKey?: string;
    meta?: Record<string, string>;
  };

export type NodeValidation<Severity extends ValidationSeverity = ValidationSeverity> = GroupedValidation<Severity> & {
  componentId: string;
  pageKey: string;
  bindingKey?: string;
  meta?: Record<string, string>;
};

// TODO(Validation): replace message string with TextResource type, to allow proper translation of messages
// TODO(Validation): Move to more appropriate location
export type TextResource = {
  key?: string | undefined;
  params?: ValidParam[];
};

export type NodeDataChange = {
  node: LayoutNode;
  fields: string[];
};

/**
 * Contains all of the necessary elements from the redux store to run frontend validations.
 */
export type IValidationContext = {
  langTools: IUseLanguage;
  formData: IFormData;
  attachments: IAttachments;
  application: IApplicationMetadata | null;
  instance: IInstance | null;
  process: IProcess | null;
  layoutSets: ILayoutSets | null;
  schemas: IJsonSchemas;
  customValidation: IExpressionValidations | null;
};

export type ValidationContextGenerator = (node: LayoutNode | undefined) => IValidationContext;

/**
 * This format is used by the backend to send validation issues to the frontend.
 */
export interface BackendValidationIssue {
  code: string;
  description: string;
  field: string;
  scope: string | null;
  severity: BackendValidationSeverity;
  targetId: string;
  source: string;
  customTextKey?: string;
}

/**
 * Expression validation object.
 */
export type IExpressionValidation = {
  message: string;
  condition: Expression | ExprValToActual;
  severity: ValidationSeverity;
};

/**
 * Expression validations for all fields.
 */
export type IExpressionValidations = {
  [field: string]: IExpressionValidation[];
};

/**
 * Expression validation or definition with references resolved.
 */
export type IExpressionValidationRefResolved = {
  message: string;
  condition: Expression | ExprValToActual;
  severity?: ValidationSeverity;
};

/**
 * Unresolved expression validation or definition from the configuration file.
 */
export type IExpressionValidationRefUnresolved =
  | IExpressionValidationRefResolved
  | {
      // If extending using a reference, assume that message and condition are inherited if undefined. This must be verified at runtime.
      message?: string;
      condition?: Expression | ExprValToActual;
      severity?: ValidationSeverity;
      ref: string;
    };

/**
 * Expression validation configuration file type.
 */
export type IExpressionValidationConfig = {
  validations: { [field: string]: (IExpressionValidationRefUnresolved | string)[] };
  definitions: { [name: string]: IExpressionValidationRefUnresolved };
};

export interface ISchemaValidator {
  rootElementPath: string;
  schema: any;
  validator: Ajv;
}

export interface ISchemaValidators {
  [id: string]: ISchemaValidator;
}

/**
 * This format is returned by the json schema validation, and needs to be mapped to components based on the datamodel bindingField.
 */
export type ISchemaValidationError = {
  message: string;
  bindingField: string;
  invalidDataType: boolean;
  keyword: string;
};
