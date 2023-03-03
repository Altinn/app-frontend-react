import type { IFormData } from 'src/features/form/data';

/**
 * @deprecated Do not use. Prefer to let components themselves figure out how to display form data
 */
export const useDisplayData = ({ formData }: { formData: IFormData | string | string[] | undefined }) => {
  if (formData) {
    if (typeof formData === 'object') {
      const displayString = Object.values(formData).join(' ').trim();
      return displayString.length > 0 ? displayString : undefined;
    }

    return formData;
  }

  return undefined;
};
