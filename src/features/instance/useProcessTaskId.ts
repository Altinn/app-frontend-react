import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';

export function useProcessTaskId() {
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const taskId = useNavigationParam('taskId');
  return currentTaskId ?? taskId;
}
