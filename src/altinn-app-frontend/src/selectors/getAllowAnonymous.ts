import type { IRuntimeState } from 'src/types';
import { createSelector } from 'reselect';
import { getDataTypeByLayoutSetId, isStatelessApp } from 'src/utils/appMetadata';

const getAllowAnonymousSelector = (state: IRuntimeState) => {
  const application = state.applicationMetadata?.applicationMetadata;

  // Require application metadata
  if (
    !application
    || !application.dataTypes
    || application.dataTypes.length === 0){
    return undefined;
  }

  if (!isStatelessApp(application)) return false;
  // Require layout sets for stateless apps
  if (!state.formLayout.layoutsets || state.formLayout.layoutsets.sets.length === 0) {
    return undefined;
  }

  const dataTypeId = getDataTypeByLayoutSetId(application.onEntry.show, state.formLayout.layoutsets);
  if (!dataTypeId) return undefined;

  const dataType = application.dataTypes.find(d => d.id === dataTypeId);
  if (dataType) {
    return dataType.allowedContentTypes?.includes('stateless'); // Mock. TODO remove when ready to use real check
    // return dataType.allowAnonymousOnStateless;  // TODO uncomment when ready to use
  }

  return false;
}

const getAllowAnonymous = () => {
  return createSelector(
    [getAllowAnonymousSelector],
    (allowAnonymous: boolean) => allowAnonymous,
  );
};

export const makeGetAllowAnonymousSelector = getAllowAnonymous;
