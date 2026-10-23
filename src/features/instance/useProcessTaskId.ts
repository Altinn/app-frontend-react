import { useTaskOverrides } from 'src/core/contexts/TaskOverrides';
import { useProcessQuery } from 'src/features/instance/useProcessQuery';
import { useNavigationParam } from 'src/hooks/navigation';
import { useIsPdf } from 'src/hooks/useIsPdf';

export function useProcessTaskId() {
  const overriddenTaskId = useTaskOverrides()?.taskId;
  const processTaskId = useProcessQuery().data?.currentTask?.elementId;
  const urlTaskId = useNavigationParam('taskId');
  const isPdf = useIsPdf();
  return overriddenTaskId ?? (isPdf ? (urlTaskId ?? processTaskId) : (processTaskId ?? urlTaskId));
}
