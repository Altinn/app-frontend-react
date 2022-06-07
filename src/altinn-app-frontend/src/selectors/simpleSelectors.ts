import type { IRuntimeState } from 'src/types';
import { IProfile } from 'altinn-shared/types';
import { makeGetAllowAnonymousSelector } from 'src/selectors/getAllowAnonymous';

export const appMetaDataSelector = (state: IRuntimeState) =>
  state.applicationMetadata.applicationMetadata;
export const instanceDataSelector = (state: IRuntimeState) =>
  state.instanceData.instance;
export const processStateSelector = (state: IRuntimeState) => state.process;
export const currentSelectedPartyIdSelector = (state: IRuntimeState) =>
  state.party.selectedParty?.partyId;
export const layoutSetsSelector = (state: IRuntimeState) =>
  state.formLayout.layoutsets;
export const profileStateSelector = (state: IRuntimeState) =>
  state.profile.profile;
export const allowAnonymousSelector = makeGetAllowAnonymousSelector();
export const selectedAppLanguageStateSelector = (state: IRuntimeState) =>{
  let selectedAppLanguage = state.language.selectedAppLanguage
  const allowAnonymous = allowAnonymousSelector(state);
  if (!allowAnonymous) {
    // Fallback to profile language if not anonymous
    const profile: IProfile = profileStateSelector(state);
    selectedAppLanguage = selectedAppLanguage || profile.profileSettingPreference.language;
  }
  // Fallback to nb if nothing is set
  return selectedAppLanguage || "nb"
}
