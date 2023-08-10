import type { IExpressionValidationDefinition } from 'src/utils/validation/types';

export type ICustomValidationState = {
  customValidation: IExpressionValidationDefinition | null;
  error: Error | null;
};
