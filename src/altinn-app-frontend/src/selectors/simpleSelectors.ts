import { createSelector } from 'reselect';

import type { IRuntimeState } from 'src/types';

export const appMetaDataSelector = (state: IRuntimeState) =>
  state.applicationMetadata.applicationMetadata;
export const instanceDataSelector = (state: IRuntimeState) =>
  state.instanceData.instance;
export const processStateSelector = (state: IRuntimeState) => state.process;
export const currentSelectedPartyIdSelector = (state: IRuntimeState) =>
  state.party.selectedParty?.partyId;
export const layoutSetsSelector = (state: IRuntimeState) =>
  state.formLayout.layoutsets;
export const memoizedLayoutSetsSelector = createSelector(
  [layoutSetsSelector],
  (sets) => {
    return sets;
  },
);
export const profileStateSelector = (state: IRuntimeState) =>
  state.profile.profile;
