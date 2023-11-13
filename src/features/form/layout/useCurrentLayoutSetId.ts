import { getLayoutSetIdForApplication } from 'src/features/applicationMetadata/appMetadataUtils';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useAppSelector } from 'src/hooks/useAppSelector';

export function useCurrentLayoutSetId() {
  const application = useAppSelector((state) => state.applicationMetadata?.applicationMetadata);
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);
  const process = useLaxProcessData();

  return getLayoutSetIdForApplication({ application, layoutSets, process });
}
