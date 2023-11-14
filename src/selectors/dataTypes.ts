import { createSelector } from 'reselect';

import { DataTypeReference, filterInstanceAttachments, filterInstancePdfAttachments } from 'src/utils/attachmentsUtils';
import type { IRuntimeState } from 'src/types';
import type { IData, IInstance, IProcess } from 'src/types/shared';

const selectDataTypes = (state: IRuntimeState) => state.applicationMetadata.applicationMetadata?.dataTypes;

export const selectDataTypesByIds = (
  dataTypeIds: string[] | undefined,
  instance: IInstance | undefined,
  process: IProcess | undefined,
) =>
  createSelector(selectDataTypes, (dataTypes = []) => {
    const currentTaskId = process?.currentTask?.elementId;
    const relevantDataTypes = dataTypes.filter((type) => type.taskId === currentTaskId);
    const useSpecificDataTypeIds = dataTypeIds && !dataTypeIds?.includes(DataTypeReference.IncludeAll);

    return instance?.data.filter((dataElement) =>
      useSpecificDataTypeIds
        ? dataTypeIds.includes(dataElement.dataType)
        : relevantDataTypes.some((type) => type.id === dataElement.dataType),
    );
  });

export const selectAttachments = (
  dataForTask: IData[] | undefined,
  includePdf: boolean | undefined,
  process: IProcess | undefined,
) =>
  createSelector(selectDataTypes, (dataTypes) => {
    const currentTaskId = process?.currentTask?.elementId;
    const defaultElementIds =
      dataTypes?.filter((dataType) => dataType.appLogic && dataType.taskId === currentTaskId).map((type) => type.id) ||
      [];

    const pdfAttachments = (includePdf && filterInstancePdfAttachments(dataForTask)) || undefined;
    const otherAttachments = filterInstanceAttachments(dataForTask, defaultElementIds);

    return [...(pdfAttachments || []), ...(otherAttachments || [])];
  });
