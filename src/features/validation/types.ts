import type { ValidParam } from 'src/hooks/useLanguage';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ValidationSeverity } from 'src/utils/validation/types';
import type { IValidationOptions } from 'src/utils/validation/validation';

export type ValidationContext = {
  state: ValidationState;
  methods: {
    validateNode: (node: LayoutNode, options: IValidationOptions) => void;
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

export type ValidationEntry = {
  field: string;
  group: string;
  severity: ValidationSeverity;
  message: string; //TODO(Validation): replace with TextResource type, to allow proper translation of messages
};

// TODO(Validation): Move to more appropriate location
export type TextResource = {
  key?: string | undefined;
  params?: ValidParam[];
};
