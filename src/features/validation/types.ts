import type { ValidationSeverity } from 'src/utils/validation/types';

export type ValidationState = {
  fields: {
    [field: string]: ServerValidation[];
  };
  unmapped: ServerValidation[];
};

export type ServerValidation = {
  field: string;
  severity: ValidationSeverity;
  message: string;
};
