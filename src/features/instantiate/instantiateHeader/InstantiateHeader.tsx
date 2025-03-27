import React from 'react';

import { Buildings3Icon, PersonIcon } from '@navikt/aksel-icons';

import { CircleIcon } from 'src/components/CircleIcon';
import { LandmarkShortcuts } from 'src/components/LandmarkShortcuts';
import { AltinnLogo, LogoColor } from 'src/components/logo/AltinnLogo';
import classes from 'src/features/instantiate/instantiateHeader/InstantiateHeader.module.css';
import { Lang } from 'src/features/language/Lang';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { returnUrlToAllForms, returnUrlToMessagebox, returnUrlToProfile } from 'src/utils/urls/urlHelper';

export const InstantiateHeader = () => {
  const currentParty = useCurrentParty();

  return (
    <div
      className={classes.appBarWrapper}
      data-testid='InstantiateHeader'
    >
      <LandmarkShortcuts
        shortcuts={[
          {
            id: 'main-content',
            text: <Lang id='navigation.to_main_content' />,
          },
        ]}
      />
      <header className={classes.appBar}>
        <AltinnLogo
          color={LogoColor.blueDark}
          className={classes.logo}
        />
        {currentParty && (
          <ul className={classes.headerLinkList}>
            <li className={classes.headerLink}>
              <a
                className='altinnLink'
                href={returnUrlToMessagebox(window.location.host, currentParty?.partyId)}
              >
                <Lang id='instantiate.inbox' />
              </a>
            </li>
            <li className={classes.headerLink}>
              <a
                className='altinnLink'
                href={returnUrlToAllForms(window.location.host)}
              >
                <Lang id='instantiate.all_forms' />
              </a>
            </li>
            <li className={classes.headerLink}>
              <a
                className='altinnLink'
                href={returnUrlToProfile(window.location.host, currentParty?.partyId)}
              >
                <Lang id='instantiate.profile' />
              </a>
            </li>
          </ul>
        )}
        {currentParty && (
          <CircleIcon
            size='1.5rem'
            className={classes.partyIcon}
            title={currentParty?.person?.name}
          >
            {currentParty.orgNumber ? (
              <Buildings3Icon
                color='white'
                aria-hidden='true'
              />
            ) : (
              <PersonIcon
                color='white'
                aria-hidden='true'
              />
            )}
          </CircleIcon>
        )}
      </header>
    </div>
  );
};
