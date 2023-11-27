export interface ISingleFieldValidation {
  layoutId: string;
  dataModelBinding: string;
}
export interface IUpdateFormData {
  skipValidation?: boolean;
  skipAutoSave?: boolean;
  singleFieldValidation?: ISingleFieldValidation;
  componentId: string;
  field: string;
}

export interface IUpdateFormDataSimple extends IUpdateFormData {
  data: string | undefined | null;
}
