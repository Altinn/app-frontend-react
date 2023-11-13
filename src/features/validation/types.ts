import type { ValidParam } from 'src/hooks/useLanguage';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ValidationSeverity } from 'src/utils/validation/types';
import type { IValidationOptions } from 'src/utils/validation/validation';

export type ValidationContext = {
  state: ValidationState;
  methods: {
    validateNode: (node: LayoutNode, options?: IValidationOptions) => void;
  };
};

export type ValidationState = Required<FormValidations>;

export type FormValidations = {
  fields?: FieldValidations;
  components?: ComponentValidations;
  task?: BaseValidation[];
};

export type ValidationGroup<T extends GroupedValidation> = {
  [group: string]: T[];
};

export type FieldValidations = {
  [field: string]: ValidationGroup<FieldValidation>;
};

export type ComponentValidations = {
  [componentId: string]: {
    bindingKeys?: { [bindingKey: string]: ValidationGroup<ComponentValidation> };
    component?: ValidationGroup<ComponentValidation>;
  };
};

type BaseValidation<Severity extends ValidationSeverity = ValidationSeverity> = {
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

export type NodeValidation<Severity extends ValidationSeverity = ValidationSeverity> = BaseValidation<Severity> & {
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
