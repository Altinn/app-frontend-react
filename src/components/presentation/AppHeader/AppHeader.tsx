import React from 'react';

import { LandmarkShortcuts } from 'src/components/LandmarkShortcuts';
import { AltinnLogo } from 'src/components/logo/AltinnLogo';
import classes from 'src/components/presentation/AppHeader/AppHeader.module.css';
import { AppHeaderMenu } from 'src/components/presentation/AppHeader/AppHeaderMenu';
import { LanguageSelector } from 'src/components/presentation/LanguageSelector';
import { OrganisationLogo } from 'src/components/presentation/OrganisationLogo/OrganisationLogo';
import { useHasAppTextsYet } from 'src/core/texts/appTexts';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { usePageSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { Lang } from 'src/features/language/Lang';
import { useInstanceOwnerParty } from 'src/features/party/PartiesProvider';
import { useProfile } from 'src/features/profile/ProfileProvider';
import type { LogoColor } from 'src/components/logo/AltinnLogo';
import type { IParty, IProfile } from 'src/types/shared';

export interface AppHeaderProps {
  logoColor: LogoColor;
  headerBackgroundColor: string;
}

export const AppHeader = ({ logoColor, headerBackgroundColor }: AppHeaderProps) => {
  const user = useProfile();
  const instanceOwnerParty = useInstanceOwnerParty();
  const { showLanguageSelector } = usePageSettings();

  const displayName = getPartyDisplayName(instanceOwnerParty, user);
  const orgNumber = instanceOwnerParty?.orgNumber ?? user?.party?.orgNumber ?? null;

  return (
    <header
      data-testid='AppHeader'
      style={{ backgroundColor: headerBackgroundColor, color: logoColor }}
    >
      <LandmarkShortcuts
        shortcuts={[
          {
            id: 'main-content',
            text: <Lang id='navigation.to_main_content' />,
          },
        ]}
      />
      <div className={classes.container}>
        <Logo color={logoColor} />
        <div className={classes.wrapper}>
          {showLanguageSelector && <LanguageSelector />}
          <div className={classes.wrapper}>
            <span className={classes.partyName}>{displayName}</span>
            <AppHeaderMenu
              orgNumber={orgNumber}
              displayName={displayName}
              logoColor={logoColor}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

const Logo = ({ color }: { color: LogoColor }) => {
  const hasLoaded = useHasAppTextsYet();

  return hasLoaded ? <MaybeOrganisationLogo color={color} /> : <AltinnLogo color={color} />;
};

const MaybeOrganisationLogo = ({ color }: { color: LogoColor }) => {
  const enableOrgLogo = Boolean(useApplicationMetadata().logoOptions);
  return enableOrgLogo ? <OrganisationLogo /> : <AltinnLogo color={color} />;
};

function getPartyDisplayName(instanceOwnerParty?: IParty, user?: IProfile) {
  if (!instanceOwnerParty && !user?.party) {
    return null;
  }

  const userParty = user?.party;

  if (instanceOwnerParty && instanceOwnerParty?.partyId !== userParty?.partyId) {
    return `${userParty?.name} for ${instanceOwnerParty?.name}`;
  }

  return userParty?.name ?? '';
}
