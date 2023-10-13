import { createSelector } from 'reselect';

import { getInstancePdf, mapInstanceAttachments } from 'src/utils/attachmentsUtils';
import type { IRuntimeState } from 'src/types';
import type { IData, IInstance, IProcess } from 'src/types/shared';

const selectDataTypes = (state: IRuntimeState) => state.applicationMetadata.applicationMetadata?.dataTypes;

export const selectDataTypesByIds = (
  dataTypeIds: string[] | undefined,
  instance: IInstance | undefined,
  process: IProcess | undefined,
) =>
  createSelector(selectDataTypes, (dataTypes = []) => {
    const instanceData = instance?.data;
    const currentTaskId = process?.currentTask?.elementId;
    const relevantDataTypes = dataTypes?.filter((type) => type.taskId === currentTaskId);
    return instanceData?.filter((dataElement) => {
      if (dataTypeIds) {
        return dataTypeIds.findIndex((id) => dataElement.dataType === id) > -1;
      }
      return relevantDataTypes.findIndex((type) => dataElement.dataType === type.id) > -1;
    });
  });

export const selectAttachments = (
  includePDF: boolean = false,
  dataForTask: IData[] | undefined,
  process: IProcess | undefined,
) =>
  createSelector(selectDataTypes, (dataTypes) => {
    const currentTaskId = process?.currentTask?.elementId;
    const appLogicDataTypes = dataTypes?.filter((dataType) => dataType.appLogic && dataType.taskId === currentTaskId);
    return includePDF
      ? getInstancePdf(dataForTask)
      : mapInstanceAttachments(dataForTask, appLogicDataTypes?.map((type) => type.id) || []);
  });
