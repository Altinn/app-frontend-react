import type Ajv from 'ajv';
import type { JSONSchema7 } from 'json-schema';

import type { IAttachments } from 'src/features/attachments';
import type { Expression, ExprValToActual } from 'src/features/expressions/types';
import type { TextReference, ValidLangParam } from 'src/features/language/useLanguage';
import type { Visibility } from 'src/features/validation/visibility';
import type { IDataType } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export enum FrontendValidationSource {
  EmptyField = '__empty_field__',
  Schema = '__schema__',
  Component = '__component__',
  Expression = '__expression__',
  InvalidData = '__invalid_data__',
}

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

export enum BuiltInValidationIssueSources {
  File = 'File',
  ModelState = 'DataAnnotations',
  Required = 'Required',
  Expression = 'Expression',
}

export enum BackendValidationSeverity {
  Error = 1,
  Warning = 2,
  Informational = 3,
  Success = 5,
}

// prettier-ignore
export enum ValidationMask {
  Schema                = 0b0000000000000001,
  Component             = 0b0000000000000010,
  Expression            = 0b0000000000000100,
  CustomBackend         = 0b0000000000001000,
  InvalidData           = 0b0000000000010000, // TODO(Validation): Should this always be visible?
  Required              = 0b0100000000000000,
  AllExceptRequired     = 0b0011111111111111, // All frontend validations except required
  All                   = 0b0111111111111111, // All frontend validations
  Backend               = 0b1000000000000000, // All backend validations except custom backend validations
  AllIncludingBackend   = 0b1111111111111111, // All validations including backend validations that overlap with frontend validations
}
export type ValidationMaskKeys = keyof typeof ValidationMask;

/* ValidationMaskCollectionKeys are used to group commonly used validation masks together. */
export type ValidationMaskCollectionKeys = Extract<
  ValidationMaskKeys,
  'All' | 'AllExceptRequired' | 'All_Including_Backend'
>;

/* ValidationCategoryKeys are ValidationMasks that represent a single validation category.*/
export type ValidationCategoryKey = Exclude<ValidationMaskKeys, ValidationMaskCollectionKeys>;
/*  A value of 0 represents a validation to be shown immediately */
export type ValidationCategory = (typeof ValidationMask)[ValidationCategoryKey] | 0;

export type ValidationContext = {
  state: ValidationState;
  validating: () => Promise<(lastBackendValidations: BackendValidationIssueGroups | undefined) => boolean>;
  visibility: Visibility;
  setNodeVisibility: (nodes: LayoutNode[], newVisibility: number, rowIndex?: number) => void;
  showAllErrors: boolean;
  setShowAllErrors: (showAllErrors: boolean) => void;
  setAttachmentVisibility: (attachmentId: string, node: LayoutNode, newVisibility: number) => void;
  removeRowVisibilityOnDelete: (node: LayoutNode<'RepeatingGroup'>, rowIndex: number) => void;
  backendValidationsProcessedLast: BackendValidationIssueGroups | undefined;
};

export type ValidationState = {
  task: BaseValidation[];
  fields: FieldValidations;
  components: ComponentValidations;
};

/**
 * Final validation format returned by backend validation.
 */
export type BackendValidations = {
  task: BaseValidation[];
  fields: FieldValidations;
};

/**
 * Validation format returned by frontend validation.
 */
export type FrontendValidations = {
  fields: FieldValidations;
  components: ComponentValidations;
};

export type FieldValidations = {
  [field: string]: FieldValidation[];
};

/**
 * Validation format returned by backend validation API.
 */
export type BackendValidationIssueGroups = {
  [validator: string]: BackendValidationIssue[];
};

/**
 * Storage format for backend validations.
 */
export type BackendValidatorGroups = {
  [validator: string]: (BaseValidation | FieldValidation)[];
};

/**
 * (Future?) storage format for frontend expression validations.
 */
export type ValidatorGroups = {
  [validator: string]: FieldValidation[];
};

/**
 * Storage format for frontend validations.
 */
export type ComponentValidations = {
  [componentId: string]: {
    bindingKeys: { [bindingKey: string]: ComponentValidation[] };
    component: ComponentValidation[];
  };
};

export type BaseValidation<Severity extends ValidationSeverity = ValidationSeverity> = {
  message: TextReference;
  severity: Severity;
  category: ValidationCategory;
  source: string;
};

/**
 * Validation message associated with a field in the datamodel
 * Typically generated by backend validators or expression validators.
 */
export type FieldValidation<Severity extends ValidationSeverity = ValidationSeverity> = BaseValidation<Severity> & {
  field: string;
};

/**
 * Validation message associated with a component in the layout
 * Typically generated by built-in frontend validators
 */
export type ComponentValidation<Severity extends ValidationSeverity = ValidationSeverity> = BaseValidation<Severity> & {
  componentId: string;
  bindingKey?: string;
  meta?: Record<string, string>;
};

/**
 * Validation message format used by frontend components. This type is derived from either FieldValidation or ComponentValidation
 */
export type NodeValidation<Severity extends ValidationSeverity = ValidationSeverity> = BaseValidation<Severity> & {
  componentId: string;
  pageKey: string;
  bindingKey?: string;
  meta?: Record<string, string>;
};

export type AttachmentChange = {
  node: LayoutNode;
  attachmentId: string;
};

/**
 * Contains all of the necessary elements from the redux store to run frontend validations.
 */
export type ValidationDataSources = {
  currentLanguage: string;
  formData: object;
  invalidData: object;
  attachments: IAttachments;
  dataType: IDataType;
  schema: JSONSchema7;
  customValidation: IExpressionValidations | null;
};

export type ValidationContextGenerator = (node: LayoutNode | undefined) => ValidationDataSources;

/**
 * This format is used by the backend to send validation issues to the frontend.
 */
export interface BackendValidationIssue {
  code?: string;
  description?: string;
  field?: string;
  dataElementId?: string;
  severity: BackendValidationSeverity;
  source: string;
  customTextKey?: string;
  customTextParams?: ValidLangParam[]; //TODO(Validation): Probably broken for text resources currently
  showImmediately?: boolean; // Not made available
  actLikeRequired?: boolean; // Not made available
}

/**
 * Expression validation object.
 */
export type IExpressionValidation = {
  message: string;
  condition: Expression | ExprValToActual;
  severity: ValidationSeverity;
  showImmediately: boolean;
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
  showImmediately?: boolean;
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
      showImmediately?: boolean;
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
  validator: Ajv;
}

export interface ISchemaValidators {
  [id: string]: ISchemaValidator;
}

/**
 * This format is returned by the json schema validation, and needs to be mapped to components based on the datamodel bindingField.
 */
export type ISchemaValidationError = {
  message: TextReference;
  bindingField: string;
  keyword: string;
};
