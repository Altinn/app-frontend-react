import { ContextNotProvided } from 'src/core/contexts/context';
import { useLaxApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';

export function useIsStatelessApp() {
  const application = useLaxApplicationMetadata();
  if (application === ContextNotProvided) {
    return false;
  }

  return application.isStatelessApp;
}
