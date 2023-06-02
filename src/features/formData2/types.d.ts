import type { IFormData } from 'src/features/formData';

interface FormDataStorage {
  currentData: object;
  lastSavedData: object;
  saving: boolean;
  unsavedChanges: boolean;
}

interface IFormDataFunctionality {
  useAsDotMap: () => IFormData;
}
