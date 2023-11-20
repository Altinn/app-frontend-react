import { useAppSelector } from 'src/hooks/useAppSelector';
import { isStatelessApp } from 'src/utils/appMetadata';

export function useIsStatelessApp() {
  const application = useAppSelector((state) => state.applicationMetadata.applicationMetadata);
  return isStatelessApp(application);
}
