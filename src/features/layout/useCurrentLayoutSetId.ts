import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { getLayoutSetIdForApplication } from 'src/utils/appMetadata';

export function useCurrentLayoutSetId() {
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata?.applicationMetadata);
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);
  const instance = useLaxInstanceData();

  if (!applicationMetadata) {
    return undefined;
  }

  return getLayoutSetIdForApplication(applicationMetadata, instance || null, layoutSets);
}
