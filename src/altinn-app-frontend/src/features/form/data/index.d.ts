export interface IFormDataState {
  formData: IFormData;
  error: Error;
  responseInstance: any;
  unsavedChanges: boolean;
  isSubmitting: string;
  isSaving: string;
  hasSubmitted: boolean;
  ignoreWarnings: boolean;
}

export interface IFormData {
  [dataFieldKey: string]: string;
}
