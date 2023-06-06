import type { IFormData } from 'src/features/formData';

interface IFormDataMethods {
  setLeafValue: (path: string, newValue: any) => void;
}

interface IFormDataFunctionality {
  useAsDotMap: () => IFormData;
  useMethods: () => IFormDataMethods;
}
