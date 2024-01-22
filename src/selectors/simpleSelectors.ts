import type { IRuntimeState } from 'src/types';

export const appMetaDataSelector = (state: IRuntimeState) => state.applicationMetadata.applicationMetadata;
export const instanceDataSelector = (state: IRuntimeState) => state.instanceData.instance;
export const currentSelectedPartyIdSelector = (state: IRuntimeState) => state.party.selectedParty?.partyId;
export const layoutSetsSelector = (state: IRuntimeState) => state.formLayout.layoutsets;
export const selectAllOrgs = (state: IRuntimeState) => state.organisationMetaData.allOrgs;
export const selectOrg = (state: IRuntimeState) => state.applicationMetadata.applicationMetadata?.org;
export const selectAppLogoSize = (state: IRuntimeState) => {
  const size = state.applicationMetadata.applicationMetadata?.logo?.size;
  if (size !== 'small' && size !== 'medium' && size !== 'large') {
    return 'small';
  }
  return size;
};
