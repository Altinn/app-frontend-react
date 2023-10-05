import React from 'react';

import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useRealTaskType } from 'src/features/instance/useProcess';
import { IsLoadingActions } from 'src/features/isLoading/isLoadingSlice';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import { ProcessTaskType } from 'src/types';

/**
 * @deprecated This is in conflict with the new instance context, and logic should be moved there
 */
export function useProcess() {
  const dispatch = useAppDispatch();

  const instanceData = useLaxInstanceData();
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
