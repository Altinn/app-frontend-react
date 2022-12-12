export interface IFormDataState {
  formData: IFormData;
  error: Error | null;
  responseInstance: any;
  unsavedChanges: boolean;
  submittingId: string;
  savingId: string;
  hasSubmitted: boolean;
  ignoreWarnings: boolean;
}

/**
 * Any of the primitive values we support inside a data model
 */
export type PrimitiveValue = string | number | bigint | boolean | null;

/**
 * Form data, flattened to a simple key/value store
 */
export interface IFormData {
  [dataFieldKey: string]: PrimitiveValue;
}

/**
 * Recursive structure/data model, as received from the backend
 */
export interface IDataModelData {
  [key: string]: PrimitiveValue | IDataModelData | IDataModelData[];
}
