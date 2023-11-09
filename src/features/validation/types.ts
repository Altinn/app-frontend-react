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

export type ValidationState = {
  fields: FieldValidations;
  unmapped: {
    [group: string]: ValidationEntry[];
  };
};

// TODO(Validation): Create generic type to ensure validation functions generate only correct groups
export type FieldValidations = {
  [field: string]: ValidationGroup;
};

export type ValidationGroup = {
  [group: string]: ValidationEntry[];
};

export type FrontendValidation<Severity extends ValidationSeverity = ValidationSeverity> = {
  field: string;
  group: string;
  bindingKey: string;
  componentId: string;
  pageKey: string;
  severity: Severity;
  message: string;
  metadata?: Record<string, string>;
};

export type ValidationEntry<Severity extends ValidationSeverity = ValidationSeverity> = {
  field: string;
  group: string;
  severity: Severity;
  message: string; //TODO(Validation): replace with TextResource type, to allow proper translation of messages
  metadata?: Record<string, string>;
};

// TODO(Validation): Move to more appropriate location
export type TextResource = {
  key?: string | undefined;
  params?: ValidParam[];
};
