import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useParties } from 'src/features/party/PartiesProvider';
import { useProfile } from 'src/features/profile/ProfileProvider';

export function usePromptForParty(): boolean | null {
  const applicationMetadata = useApplicationMetadata();
  const profile = useProfile();
  const parties = useParties();

  if (!profile?.partyId || !parties) {
    console.log('null');
    return null;
  }

  if (applicationMetadata.promptForParty === 'never') {
    console.log('never');
    return false;
  }

  if (applicationMetadata.promptForParty === 'always') {
    console.log('always');
    return true;
  }

  // No point in prompting if there is only one party
  if (parties.length === 1) {
    console.log('length 1');
    return false;
  }

  console.log('pofile setting', profile.profileSettingPreference.doNotPromptForParty);

  return !profile.profileSettingPreference.doNotPromptForParty;
}

export function useForcePromptForParty(): boolean {
  const applicationMetadata = useApplicationMetadata();
  return applicationMetadata.promptForParty === 'always';
}
