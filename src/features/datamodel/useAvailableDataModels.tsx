import type { IDataType } from 'src/types/shared';

export enum DataTypeVariant {
  Pdf = 'pdf',
  Attachment = 'attachment',
  DataModel = 'dataModel',
}

export function getDataTypeVariant(dataType: IDataType): DataTypeVariant {
  if (dataType.id === 'ref-data-as-pdf') {
    return DataTypeVariant.Pdf;
  }

  if (dataType.appLogic?.classRef) {
    return DataTypeVariant.DataModel;
  }

  return DataTypeVariant.Attachment;
}
