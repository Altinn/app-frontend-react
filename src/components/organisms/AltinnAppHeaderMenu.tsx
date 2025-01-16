import React, { useState } from 'react';

import { DropdownMenu } from '@digdir/designsystemet-react';
import { Buildings3Icon, PersonIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { CircleIcon } from 'src/components/CircleIcon';
import classes from 'src/components/organisms/AltinnAppHeaderMenu.module.css';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { renderPartyName } from 'src/utils/party';
import { logoutUrlAltinn } from 'src/utils/urls/urlHelper';
import type { IParty } from 'src/types/shared';

export interface IAltinnAppHeaderMenuProps {
  party: IParty | undefined;
  userParty: IParty | undefined;
  logoColor: string;
}

export function AltinnAppHeaderMenu({ party, userParty, logoColor }: IAltinnAppHeaderMenuProps) {
  const { langAsString } = useLanguage();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (!party) {
    return null;
  }

  return (
    <DropdownMenu
      size='sm'
      open={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <DropdownMenu.Trigger
        size='sm'
        variant='tertiary'
        style={{ padding: 0, borderRadius: '50%' }}
        aria-label={langAsString('general.header_profile_icon_label')}
        onClick={() => setIsOpen((o) => !o)}
        className={cn({ [classes.buttonActive]: isOpen })}
      >
        <CircleIcon
          size='1.5rem'
          color={logoColor}
        >
          {party.orgNumber ? (
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
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group heading={isMobile ? renderPartyName(party, userParty) : undefined}>
          <DropdownMenu.Item asChild>
            <a href={logoutUrlAltinn(window.location.host)}>
              <Lang id='general.log_out' />
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
