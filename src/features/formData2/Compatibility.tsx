import { NewFD } from 'src/features/formData2/FormDataContext';
import type { IFormData } from 'src/features/formData';
import type { IFormDataFunctionality } from 'src/features/formData2/types';

/**
 * @deprecated
 */
export function SagaFetchFormDataCompat(): IFormData {
  return window.deprecated.currentFormData;
}

export const FD: IFormDataFunctionality = NewFD;
