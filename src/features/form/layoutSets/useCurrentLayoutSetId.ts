import { ContextNotProvided } from 'src/core/contexts/context';
import { useLaxApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { getLayoutSetIdForApplication, isStatelessApp } from 'src/features/applicationMetadata/appMetadataUtils';
import { useLaxLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';

export function useCurrentLayoutSetId() {
  const application = useLaxApplicationMetadata();
  const layoutSets = useLaxLayoutSets();
  const taskId = useProcessTaskId();

  if (application === ContextNotProvided || layoutSets === ContextNotProvided) {
    return undefined;
  }

  return getLayoutSetIdForApplication({ application, layoutSets, taskId });
}

export function useCurrentLayoutSet() {
  const application = useLaxApplicationMetadata();
  const layoutSets = useLaxLayoutSets();
  const taskId = useProcessTaskId();

  if (application === ContextNotProvided || layoutSets === ContextNotProvided) {
    return undefined;
  }

  const showOnEntry = application.onEntry?.show;
  if (isStatelessApp(application)) {
    return layoutSets?.sets.find((set) => set.id === showOnEntry);
  }

  if (taskId == null) {
    return undefined;
  }

  return layoutSets.sets.find((set) => set.tasks?.includes(taskId));
}
