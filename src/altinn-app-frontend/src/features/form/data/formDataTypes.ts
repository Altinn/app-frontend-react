import type { IDataModelBindings } from 'src/types';

export interface IFetchFormData {
  url: string;
}

export interface IFetchFormDataFulfilled {
  formData: any;
}

export interface IFormDataRejected {
  error: Error;
}

export interface ISubmitDataAction {
  apiMode?: string;
  stopWithWarnings?: boolean;
}

export interface IUpdateFormDataProps {
  skipValidation?: boolean;
  skipAutoSave?: boolean;
  checkIfRequired?: boolean;
}

export interface IUpdateFormData extends IUpdateFormDataProps {
  field: string;
  data: any;
  componentId?: string;
}

export interface IUpdateFormDataFulfilled extends IUpdateFormDataProps {
  field: string;
  data: any;
}

export interface IDeleteAttachmentReference {
  attachmentId: string;
  componentId: string;
  dataModelBindings: IDataModelBindings;
}
