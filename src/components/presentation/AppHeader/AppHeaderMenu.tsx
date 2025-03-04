import React, { useState } from 'react';

import { Dropdown } from '@digdir/designsystemet-react';
import { Buildings3Icon, PersonIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { CircleIcon } from 'src/components/CircleIcon';
import classes from 'src/components/presentation/AppHeader/AppHeaderMenu.module.css';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { getPartyDisplayName } from 'src/utils/party';
import { logoutUrlAltinn } from 'src/utils/urls/urlHelper';
import type { IParty, IProfile } from 'src/types/shared';

export interface AppHeaderMenuProps {
  party: IParty | undefined;
  user: IProfile | undefined;
  logoColor: string;
}

export function AppHeaderMenu({ party, user, logoColor }: AppHeaderMenuProps) {
  const { langAsString } = useLanguage();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (!party) {
    return <div style={{ height: 40 }} />;
  }

  return (
    <Dropdown.TriggerContext>
      <Dropdown.Trigger
        data-size='sm'
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
      </Dropdown.Trigger>
      <Dropdown
        data-size='sm'
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        {isMobile && <Dropdown.Heading>{getPartyDisplayName(party, user)}</Dropdown.Heading>}
        <Dropdown.List>
          <Dropdown.Item>
            <Dropdown.Button asChild>
              <a href={logoutUrlAltinn(window.location.host)}>
                <Lang id='general.log_out' />
              </a>
            </Dropdown.Button>
          </Dropdown.Item>
        </Dropdown.List>
      </Dropdown>
    </Dropdown.TriggerContext>
  );
}
