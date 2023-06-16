import type { ValidationSeverity } from 'src/types';

export type IValidationObject = {
  pageKey: string;
  componentId: string;
  bindingKey: string;
  severity: ValidationSeverity;
  message: string;
  invalidDataTypes: boolean;
  rowIndices: number[];
};
