export interface IFormDataState {
  // The component IDs which triggered a submit (saving the form data in order to move to the next step)
  submittingId: string;

  error: Error | null;

  // Setting this to true will force a re-fetch of the form data.
  reFetch?: boolean;
}

export interface IFormData {
  [dataFieldKey: string]: string;
}
