import { useAppSelector } from 'src/hooks/useAppSelector';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';

export function useDoNotPromptForParty(): boolean | null {
  const { partyId: partyIdFromUrl } = useInstanceIdParams();
  const profile = useAppSelector((state) => state.profile.profile);
  const parties = useAppSelector((state) => state.party.parties);
  if (!profile.partyId || parties === null) {
    return null;
  }

  // Navigate to party selection which will say there are no valid parties
  if (parties.length === 0) {
    return false;
  }

  // No point in prompting if there is only one party
  if (parties.length === 1) {
    return true;
  }

  return !!partyIdFromUrl || profile.profileSettingPreference.doNotPromptForParty;
}
