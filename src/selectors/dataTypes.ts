import { createSelector } from 'reselect';

import { filterInstanceAttachments } from 'src/utils/attachmentsUtils';
import type { IRuntimeState } from 'src/types';
import type { IData } from 'src/types/shared';

const selectDataTypes = (state: IRuntimeState) => state.applicationMetadata.applicationMetadata?.dataTypes;
const selectInstanceData = (state: IRuntimeState) => state.instanceData.instance?.data;
const selectCurrentTaskId = (state: IRuntimeState) => state.instanceData.instance?.process?.currentTask?.elementId;

export const selectDataTypesByIds = (dataTypeIds: string[] | undefined) =>
  createSelector(
    selectDataTypes,
    selectCurrentTaskId,
    selectInstanceData,
    (dataTypes = [], currentTask, instanceData) => {
      const relevantDataTypes = dataTypes?.filter((type) => type.taskId === currentTask);
      const useSpecificDataTypeIds = dataTypeIds && !dataTypeIds?.includes('include-all');
      return instanceData?.filter((dataElement) =>
        useSpecificDataTypeIds
          ? dataTypeIds.includes(dataElement.dataType)
          : relevantDataTypes.some((type) => type.id === dataElement.dataType),
      );
    },
  );

export const selectAttachments = (dataForTask: IData[] | undefined) =>
  createSelector(selectDataTypes, selectCurrentTaskId, (dataTypes, currentTaskId) => {
    const defaultElementIds =
      dataTypes?.filter((dataType) => dataType.appLogic && dataType.taskId === currentTaskId).map((type) => type.id) ||
      [];

    return filterInstanceAttachments(dataForTask, defaultElementIds);
  });
