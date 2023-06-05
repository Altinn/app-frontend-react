import type { IFormData } from 'src/features/formData';

interface IFormDataMethods {
  setLeafValue: (path: string, value: any) => void;
}

interface IFormDataFunctionality {
  useAsDotMap: () => IFormData;
  useMethods: () => IFormDataMethods;
}
