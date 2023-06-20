import type { ValidationSeverity } from 'src/types';

export type IValidationObject = IValidationMessage | IEmptyValidation;

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

export type ISchemaValidationError = { message: string; bindingField: string; invalidDataType: boolean };
