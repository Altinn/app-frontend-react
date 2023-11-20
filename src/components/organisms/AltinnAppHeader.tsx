import React from 'react';

import { AppBar } from '@material-ui/core';

import { LandmarkShortcuts } from 'src/components/LandmarkShortcuts';
import { AltinnLogo } from 'src/components/logo/AltinnLogo';
import classes from 'src/components/organisms/AltinnAppHeader.module.css';
import { AltinnAppHeaderMenu } from 'src/components/organisms/AltinnAppHeaderMenu';
import { OrganisationLogo } from 'src/components/presentation/OrganisationLogo/OrganisationLogo';
import {
  useApplicationMetadata,
  useHasApplicationMetadata,
} from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useHasOrgs } from 'src/features/orgs/OrgsProvider';
import { useHasTextResources } from 'src/features/textResources/TextResourcesProvider';
import { useLanguage } from 'src/hooks/useLanguage';
import { renderPartyName } from 'src/utils/party';
import type { IAltinnLogoProps } from 'src/components/logo/AltinnLogo';
import type { IParty } from 'src/types/shared';

type LogoColor = IAltinnLogoProps['color'];

export interface IAltinnAppHeaderProps {
  /** The party of the instance owner */
  party: IParty | undefined;
  /** The party of the currently logged in user */
  userParty: IParty | undefined;
  logoColor: LogoColor;
  headerBackgroundColor: string;
}

export const AltinnAppHeader = ({ logoColor, headerBackgroundColor, party, userParty }: IAltinnAppHeaderProps) => {
  const { langAsString } = useLanguage();

  return (
    <AppBar
      data-testid='AltinnAppHeader'
      position='relative'
      classes={{ root: classes.appBar }}
      style={{ backgroundColor: headerBackgroundColor, color: logoColor }}
    >
      <LandmarkShortcuts
        shortcuts={[
          {
            id: 'main-content',
            text: langAsString('navigation.to_main_content'),
          },
        ]}
      />
      <div className={classes.container}>
        <Logo color={logoColor} />
        <div className={classes.wrapper}>
          {party && userParty && party.partyId === userParty.partyId && (
            <span className={classes.appBarText}>{renderPartyName(userParty)}</span>
          )}
          {party && userParty && party.partyId !== userParty.partyId && (
            <>
              <span className={classes.appBarText}>
                {renderPartyName(userParty)} for {renderPartyName(party)}
              </span>
            </>
          )}
          <AltinnAppHeaderMenu
            party={party}
            logoColor={logoColor}
            logoutText={langAsString('general.log_out')}
            ariaLabel={langAsString('general.header_profile_icon_label')}
          />
        </div>
      </div>
    </AppBar>
  );
};

const Logo = ({ color }: { color: LogoColor }) => {
  const hasAppMetadata = useHasApplicationMetadata();
  const hasOrgs = useHasOrgs();
  const hasTexts = useHasTextResources();
  const hasLoaded = hasAppMetadata && hasOrgs && hasTexts;

  return hasLoaded ? <MaybeOrganisationLogo color={color} /> : <AltinnLogo color={color} />;
};

const MaybeOrganisationLogo = ({ color }: { color: LogoColor }) => {
  const enableOrgLogo = useApplicationMetadata().logo !== null;
  return enableOrgLogo ? <OrganisationLogo /> : <AltinnLogo color={color} />;
};
