import React from 'react';

import { IsLoadingActions } from 'src/features/isLoading/isLoadingSlice';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useInstanceData } from 'src/hooks/queries/useInstance';
import { useRealTaskType } from 'src/hooks/queries/useProcess';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import { ProcessTaskType } from 'src/types';

export function useProcess() {
  const dispatch = useAppDispatch();

  const instanceData = useInstanceData();
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata.applicationMetadata);
  const taskType = useRealTaskType();

  React.useEffect(() => {
    if (!applicationMetadata || !instanceData) {
      return;
    }

    if (taskType === ProcessTaskType.Data) {
      dispatch(QueueActions.startInitialDataTaskQueue());
      return;
    }

    switch (taskType) {
      case ProcessTaskType.Confirm:
      case ProcessTaskType.Feedback:
        dispatch(QueueActions.startInitialInfoTaskQueue());
        break;
      case ProcessTaskType.Archived: {
        dispatch(IsLoadingActions.finishDataTaskIsLoading());
        break;
      }
      default:
        break;
    }
  }, [taskType, applicationMetadata, instanceData, dispatch]);

  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);
  return { appOwner, appName };
}
