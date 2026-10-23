import { useProcessQuery } from 'src/features/instance/useProcessQuery';
import { useNavigationParam } from 'src/hooks/navigation';
import { useIsPdf } from 'src/hooks/useIsPdf';

/**
 * A preview can render a later PDF task while the current task's data is still writable.
 * Rendering that other task must not change the current task's form data.
 */
export function useIsPdfOfOtherTask() {
  const isPdf = useIsPdf();
  const taskId = useNavigationParam('taskId');
  const currentTaskId = useProcessQuery().data?.currentTask?.elementId;
  return isPdf && taskId !== undefined && currentTaskId !== undefined && taskId !== currentTaskId;
}
