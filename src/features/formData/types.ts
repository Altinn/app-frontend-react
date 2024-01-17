import type { JsonPatch } from 'src/features/formData/jsonPatch/types';
import type { BackendValidationIssueGroups, ValidationIssueSources } from 'src/features/validation';

/**
 * This is the default time (in milliseconds) to wait before debouncing the form data. That means, we'll wait this
 * long before we move the data the user is currently typing into the debouncedCurrentData object. The debounced
 * data is less fresh than currentData, but it's the data we'll use to evaluate expressions, output in text resources,
 * etc. Over time we might migrate to fresher data for these use-cases as well.
 *
 * The amount of time we'll wait before saving the data to the server usually also this value, but it can be
 * configured separately by for example saving the data on page navigation only.
 */
export const DEFAULT_DEBOUNCE_TIMEOUT = 400;

export interface IDataModelPatchRequest {
  patch: JsonPatch;
  ignoredValidators: ValidationIssueSources[];
}

export interface IDataModelPatchResponse {
  validationIssues: BackendValidationIssueGroups;
  newDataModel: object;
}
