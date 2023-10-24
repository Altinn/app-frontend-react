export interface IFetchFormDataFulfilled {
  formData: any;
}

export interface IFormDataRejected {
  error: Error | null;
}

export interface ISingleFieldValidation {
  layoutId: string;
  dataModelBinding: string;
}

export interface ISaveAction {
  field?: string;
  componentId?: string;
  singleFieldValidation?: ISingleFieldValidation;
}

export interface IUpdateFormData {
  skipValidation?: boolean;
  skipAutoSave?: boolean;
  singleFieldValidation?: ISingleFieldValidation;
  componentId?: string;
  field: string;
  data: any;
}
