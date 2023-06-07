import { useAppSelector } from 'src/hooks/useAppSelector';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import type { IAltinnWindow } from 'src/types';

export function useDoNotPromptForParty(): boolean | null {
  const { partyId: partyIdFromUrl } = useInstanceIdParams();
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata.applicationMetadata);
  const profile = useAppSelector((state) => state.profile.profile);
  const parties = useAppSelector((state) => state.party.parties);
  const altinnWindow = window as Window as IAltinnWindow;

  if (!profile.partyId || parties === null) {
    return null;
  }

  if (!altinnWindow.featureToggles.UseDoNotPromptForPartyPreference) {
    return true;
  }

  if (applicationMetadata?.promptForParty === 'never') {
    return true;
  }

  if (applicationMetadata?.promptForParty === 'always') {
    return false;
  }

  // No point in prompting if there is only one party
  if (parties.length === 1) {
    return true;
  }

  return !!partyIdFromUrl || profile.profileSettingPreference.doNotPromptForParty;
}
