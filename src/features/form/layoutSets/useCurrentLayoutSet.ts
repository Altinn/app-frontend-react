import { useTaskStore } from 'src/core/contexts/taskStoreContext';
import { useApplicationMetadata, useLayoutSets } from 'src/features/appData/hooks';
import { getCurrentLayoutSet } from 'src/features/applicationMetadata/appMetadataUtils';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';

export function useCurrentLayoutSetId() {
  return useCurrentLayoutSet()?.id;
}

export function useCurrentLayoutSet() {
  const application = useApplicationMetadata();
  const layoutSets = useLayoutSets();
  const taskId = useProcessTaskId();
  const overriddenLayoutSetId = useTaskStore((state) => state.overriddenLayoutSetId);

  if (overriddenLayoutSetId) {
    return layoutSets.find((set) => set.id === overriddenLayoutSetId);
  }

  return getCurrentLayoutSet({ application, layoutSets, taskId });
}
