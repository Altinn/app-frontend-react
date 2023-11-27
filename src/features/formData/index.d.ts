export interface IFormDataState {
  // Indicates that form has been validated and is ready to move to the next process step (set when the submit button
  // is clicked and validation is OK). If validation fails, the state will be set back to 'inactive'.
  // - 'inactive' means that no submission has been attempted yet, or that the last submission failed
  // - 'validating' means that the submission is currently being validated
  // - 'validationSuccessful' means that the submission has been validated and is ready to be sent to the backend
  // - 'working' means that the submission is currently being sent to the backend (validation may or may not have
  //   succeeded)
  submittingState: 'inactive' | 'validating' | 'validationSuccessful' | 'working';

  // Setting this to true will force a re-fetch of the form data.
  reFetch?: boolean;
}

export interface IFormData {
  [dataFieldKey: string]: string;
}
