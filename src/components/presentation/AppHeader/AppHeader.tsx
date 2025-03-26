import React from 'react';
import { useParams } from 'react-router-dom';

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
import { useCurrentParty, useInstanceOwnerParty } from 'src/features/party/PartiesProvider';
import { useProfile } from 'src/features/profile/ProfileProvider';
import type { LogoColor } from 'src/components/logo/AltinnLogo';

export interface AppHeaderProps {
  logoColor: LogoColor;
  headerBackgroundColor: string;
}

export const AppHeader = ({ logoColor, headerBackgroundColor }: AppHeaderProps) => {
  const { showLanguageSelector } = usePageSettings();

  const { displayName, orgNumber } = useGetOnBehalfOf();

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

function useGetOnBehalfOf() {
  const instanceOwnerParty = useInstanceOwnerParty();
  const currentParty = useCurrentParty();
  const userParty = useProfile()?.party;

  const isInsideActiveInstance = !!useParams().instanceOwnerPartyId;

  let displayName = userParty?.name;
  if (isInsideActiveInstance && instanceOwnerParty && instanceOwnerParty?.partyId !== userParty?.partyId) {
    displayName = `${displayName} for ${instanceOwnerParty?.name}`;
  } else if (currentParty?.partyId !== userParty?.partyId) {
    displayName = `${displayName} for ${instanceOwnerParty?.name ?? currentParty?.name ?? userParty?.name ?? ''}`;
  }

  const orgNumber = instanceOwnerParty?.orgNumber ?? userParty?.orgNumber ?? undefined;

  return { displayName, orgNumber };
}
