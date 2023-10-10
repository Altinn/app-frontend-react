import React from 'react';

import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useRealTaskType } from 'src/features/instance/useProcess';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { ProcessTaskType } from 'src/types';
import { createStrictContext } from 'src/utils/createContext';

const { Provider } = createStrictContext<undefined>();

/**
 * @deprecated This is in conflict with the new instance context, and logic should be moved there
 */
function useLegacyProcessTriggers() {
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
      default:
        break;
    }
  }, [taskType, applicationMetadata, instanceData, dispatch]);
}

export const LegacyProcessTriggersProvider = ({ children }: { children: React.ReactNode }) => {
  useLegacyProcessTriggers();

  return <Provider value={undefined}>{children}</Provider>;
};
