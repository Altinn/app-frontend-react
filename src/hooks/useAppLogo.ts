import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';

export function useDisplayAppOwnerNameInHeader() {
  const application = useApplicationMetadata();
  return application.logo?.displayAppOwnerNameInHeader ?? true;
}

export function useAppLogoSize() {
  const application = useApplicationMetadata();
  const size = application.logo?.size;

  if (size !== 'small' && size !== 'medium' && size !== 'large') {
    return 'small';
  }
  return size;
}
