export interface IFetchFormDataFulfilled {
  formData: any;
}

export interface ISaveAction {
  field?: string;
  componentId?: string;
}

export interface IUpdateFormData {
  skipAutoSave?: boolean;
  componentId: string;
  field: string;
}

export interface IUpdateFormDataSimple extends IUpdateFormData {
  data: string | undefined | null;
}

export interface IUpdateFormDataAddToList extends IUpdateFormData {
  itemToAdd: string;
}

export interface IUpdateFormDataRemoveFromList extends IUpdateFormData {
  itemToRemove: string;
}
