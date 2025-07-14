import { useApplicationMetadata } from 'src/features/appData/hooks';
import { getDataTypeByLayoutSetId } from 'src/features/applicationMetadata/appMetadataUtils';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';

export const useAllowAnonymous = () => {
  const application = useApplicationMetadata();
  const layoutSets = useLayoutSets();

  if (!application.isStatelessApp) {
    return false;
  }

  const dataTypeId = getDataTypeByLayoutSetId({
    layoutSetId: application.onEntry.show,
    layoutSets,
    appMetaData: application,
  });
  const dataType = application.dataTypes.find((d) => d.id === dataTypeId);
  const allowAnonymous = dataType?.appLogic?.allowAnonymousOnStateless;
  if (allowAnonymous !== undefined && allowAnonymous !== null) {
    return allowAnonymous;
  }

  return false;
};

export const useAllowAnonymousIs = (compareWith: boolean) => {
  const allowAnonymous = useAllowAnonymous();
  return allowAnonymous === compareWith;
};
