export interface IFormDataState {
  // This is the constantly mutated object containing the current form data/data model. In key-value form.
  formData: IFormData;

  // Last saved form data. This one is a copy of the above, and will be copied from there after each save. This means
  // we can remember everything that changed, along with previous values, and pass them to the backend when we save
  // values. Do not change this unless you know what you're doing.
  lastSavedFormData: IFormData;

  error: Error | null;
  responseInstance: any;
  unsavedChanges: boolean;
  submittingId: string;
  savingId: string;
  hasSubmitted: boolean;
  ignoreWarnings: boolean;
}

export interface IFormData {
  [dataFieldKey: string]: string;
}
