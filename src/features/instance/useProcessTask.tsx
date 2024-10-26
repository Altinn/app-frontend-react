import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { TaskKeys } from 'src/hooks/useNavigatePage';
import { ProcessTaskType } from 'src/types';
import { behavesLikeDataTask } from 'src/utils/formLayout';

/**
 * This hook returns a function to find the taskType of a given taskId.
 */
export function useGetTaskType() {
  const processData = useLaxProcessData();
  const isStateless = useApplicationMetadata().isStatelessApp;
  const layoutSets = useLayoutSets();

  return (taskId: string | undefined) => {
    const task =
      (processData?.processTasks?.find((t) => t.elementId === taskId) ?? processData?.currentTask?.elementId === taskId)
        ? processData?.currentTask
        : undefined;

    if (isStateless) {
      // Stateless apps only have data tasks. As soon as they start creating an instance from that stateless step,
      // applicationMetadata.isStatelessApp will return false and we'll proceed as normal.
      return ProcessTaskType.Data;
    }

    if (taskId === TaskKeys.CustomReceipt) {
      return ProcessTaskType.Data;
    }

    if (taskId === TaskKeys.ProcessEnd) {
      return ProcessTaskType.Archived;
    }

    if (processData?.ended) {
      return ProcessTaskType.Archived;
    }
    if (task === undefined || task?.altinnTaskType === undefined) {
      return ProcessTaskType.Unknown;
    }

    const isDataTask = behavesLikeDataTask(task.elementId, layoutSets);
    return isDataTask ? ProcessTaskType.Data : (task.altinnTaskType as ProcessTaskType);
  };
}

/**
 * This returns the task type of the current process task, as we want to use it in the frontend. Some tasks
 * are configured to behave like data tasks, and we want to treat them as such.
 *
 * @see useTaskTypeFromBackend
 */
export function useCurrentTaskTypeFromProcess() {
  const taskId = useLaxProcessData()?.currentTask?.elementId;
  const isStateless = useApplicationMetadata().isStatelessApp;
  const taskType = useTaskTypeFromBackend();
  const layoutSets = useLayoutSets();

  if (isStateless) {
    // Stateless apps only have data tasks. As soon as they start creating an instance from that stateless step,
    // applicationMetadata.isStatelessApp will return false and we'll proceed as normal.
    return ProcessTaskType.Data;
  }

  const isDataTask = behavesLikeDataTask(taskId, layoutSets);
  return isDataTask ? ProcessTaskType.Data : taskType;
}

/**
 * This returns the task type of the current process task, as we got it from the backend
 *
 * @see useCurrentTaskTypeFromProcess
 */
export function useTaskTypeFromBackend() {
  const processData = useLaxProcessData();

  if (processData?.ended) {
    return ProcessTaskType.Archived;
  }

  if (processData?.currentTask?.altinnTaskType) {
    return processData.currentTask.altinnTaskType as ProcessTaskType;
  }

  return ProcessTaskType.Unknown;
}
