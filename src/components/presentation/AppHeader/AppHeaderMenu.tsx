import React, { useState } from 'react';

import { DropdownMenu } from '@digdir/designsystemet-react';
import { Buildings3Icon, PersonIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { CircleIcon } from 'src/components/CircleIcon';
import classes from 'src/components/presentation/AppHeader/AppHeaderMenu.module.css';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { logoutUrlAltinn } from 'src/utils/urls/urlHelper';

export interface AppHeaderMenuProps {
  orgNumber: string | undefined;
  displayName: string | undefined;
  logoColor: string;
}

export function AppHeaderMenu({ orgNumber, displayName, logoColor }: AppHeaderMenuProps) {
  const { langAsString } = useLanguage();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (!orgNumber && !displayName) {
    return <div style={{ height: 40 }} />;
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
          {orgNumber ? (
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
        <DropdownMenu.Group heading={isMobile ? displayName : undefined}>
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
