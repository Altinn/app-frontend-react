import React, { useEffect } from 'react';

import { useTaskStore } from 'src/core/contexts/taskStoreContext';
import { FormProvider } from 'src/features/form/FormContext';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';

interface TaskSummaryProps {
  taskId?: string;
  targetId?: string;
  type?: string;
}

export function TaskSummaryWrapper({ taskId, children }: React.PropsWithChildren<TaskSummaryProps>) {
  const setTaskId = useTaskStore((state) => state.setTaskId);
  const setOverriddenDataModelType = useTaskStore((state) => state.setOverriddenDataModelType);
  const setOverriddenDataModelUuid = useTaskStore((state) => state.setOverriddenDataModelUuid);
  const setOverriddenLayoutSetId = useTaskStore((state) => state.setOverriddenLayoutSetId);
  const overriddenTaskId = useTaskStore((state) => state.overriddenTaskId);

  const layoutSets = useLayoutSets();

  useEffect(() => {
    if (taskId) {
      const layoutSetForTask = layoutSets.find((set) => set.tasks?.includes(taskId));
      setTaskId && setTaskId(taskId);
      if (layoutSetForTask) {
        setOverriddenDataModelType && setOverriddenDataModelType(layoutSetForTask.dataType);
        setOverriddenLayoutSetId && setOverriddenLayoutSetId(layoutSetForTask.id);
      }
    }
  }, [layoutSets, setOverriddenDataModelType, setOverriddenDataModelUuid, setOverriddenLayoutSetId, setTaskId, taskId]);

  if (overriddenTaskId) {
    return <FormProvider>{children}</FormProvider>;
  }
  return children;
}
