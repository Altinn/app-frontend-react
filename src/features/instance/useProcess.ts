import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { ProcessTaskType } from 'src/types';
import { behavesLikeDataTask } from 'src/utils/formLayout';
import type { ChangeInstanceData } from 'src/features/instance/InstanceContext';
import type { IInstance } from 'src/types/shared';

interface QueryProps {
  instanceId: string | undefined;
  taskId: string | undefined;
}

function useProcessQuery({ instanceId, taskId }: QueryProps) {
  const { fetchProcessState } = useAppQueries();

  return useQuery({
    queryKey: ['fetchProcessState', instanceId, taskId],
    queryFn: () => fetchProcessState(instanceId || ''),
    enabled: !!instanceId && !!taskId,
  });
}

export function useProcessEnhancement(instance: IInstance | undefined, changeData: ChangeInstanceData) {
  const enhancedProcessState = useProcessQuery({
    instanceId: instance?.id,
    taskId: instance?.process?.currentTask?.elementId,
  });

  useEffect(() => {
    if (enhancedProcessState.data) {
      changeData((data) =>
        data
          ? {
              ...data,
              process: enhancedProcessState.data,
            }
          : data,
      );
    }
  }, [enhancedProcessState.data, changeData]);
}

export const useProcessData = () => useLaxInstanceData()?.process;

/**
 * This returns the task type of the current process task, as we got it from the backend
 *
 * @see useRealTaskType
 */
export function useTaskTypeFromBackend() {
  const processData = useProcessData();

  if (processData?.ended) {
    return ProcessTaskType.Archived;
  }

  if (processData?.currentTask?.altinnTaskType) {
    return processData.currentTask.altinnTaskType as ProcessTaskType;
  }

  return ProcessTaskType.Unknown;
}

/**
 * This returns the task type of the current process task, as we want to use it in the frontend. Some tasks
 * are configured to behave like data tasks, and we want to treat them as such.
 *
 * @see useTaskTypeFromBackend
 */
export function useRealTaskType() {
  const taskId = useProcessData()?.currentTask?.elementId;
  return useRealTaskTypeById(taskId || undefined);
}

export function useRealTaskTypeById(taskId: string | undefined) {
  const taskType = useTaskTypeFromBackend();
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);
  const isDataTask = behavesLikeDataTask(taskId, layoutSets);
  return isDataTask ? ProcessTaskType.Data : taskType;
}
