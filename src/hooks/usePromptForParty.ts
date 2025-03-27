import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { usePartiesAllowedToInstantiate } from 'src/features/party/PartiesProvider';
import { useProfile } from 'src/features/profile/ProfileProvider';

export function usePromptForParty(): boolean | null {
  const applicationMetadata = useApplicationMetadata();
  const profile = useProfile();
  const partiesAllowedToInstantiate = usePartiesAllowedToInstantiate();

  if (!profile?.partyId || !partiesAllowedToInstantiate) {
    return null;
  }

  if (applicationMetadata.promptForParty === 'never') {
    return false;
  }

  if (applicationMetadata.promptForParty === 'always') {
    return true;
  }

  // No point in prompting if there is only one party
  if (partiesAllowedToInstantiate.length === 1) {
    return false;
  }
  return !profile.profileSettingPreference.doNotPromptForParty;
}

export function useForcePromptForParty(): boolean {
  const applicationMetadata = useApplicationMetadata();
  return applicationMetadata.promptForParty === 'always';
}
