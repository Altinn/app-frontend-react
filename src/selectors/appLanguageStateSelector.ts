import { makeGetAllowAnonymousSelector } from 'src/selectors/getAllowAnonymous';
import { profileStateSelector } from 'src/selectors/simpleSelectors';
import type { IRuntimeState } from 'src/types';
import type { IProfile } from 'src/types/shared';

const selectedAppLanguageStateSelector = (state: IRuntimeState) => state.profile.selectedAppLanguage;

/**
 * @deprecated
 * @see useLanguage
 */
export const appLanguageStateSelector = (state: IRuntimeState) => {
  let selectedAppLanguage = selectedAppLanguageStateSelector(state);
  const allowAnonymous = makeGetAllowAnonymousSelector()(state);
  if (!allowAnonymous) {
    // Fallback to profile language if not anonymous
    const profile: IProfile = profileStateSelector(state);
    selectedAppLanguage = selectedAppLanguage || profile.profileSettingPreference.language;
  }
  // Fallback to nb if nothing is set
  return selectedAppLanguage || 'nb';
};
