import type { IComponentValidations } from 'src/types';

export type IValidationOutput = {
  pageKey: string;
  componentId: string;
  validations: IComponentValidations;
  invalidDataTypes: boolean;
};
