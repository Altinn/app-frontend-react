import React from 'react';

import { FullscreenEnter, FullscreenExit, Left } from '@navikt/ds-icons';
import cn from 'classnames';

import { Button } from 'src/app-components/button/Button';
import { LanguageSelector } from 'src/components/presentation/LanguageSelector';
import classes from 'src/components/presentation/NavBar.module.css';
import { useUiConfigContext } from 'src/features/form/layout/UiConfigContext';
import { usePageSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { PopoverNavigation } from 'src/features/navigation/AppNavigation';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { useIsLocalTest, useIsStudioPreview } from 'src/hooks/useIsDev';
import { httpGet } from 'src/utils/network/networking';
import { getRedirectUrl } from 'src/utils/urls/appUrlHelper';
import { returnUrlToMessagebox } from 'src/utils/urls/urlHelper';

const expandIconStyle = { transform: 'rotate(45deg)' };

export const NavBar = () => {
  const { langAsString } = useLanguage();
  const party = useCurrentParty();
  const { expandedWidth, toggleExpandedWidth } = useUiConfigContext();
  const { hideCloseButton, showLanguageSelector, showExpandWidthButton } = usePageSettings();
  const isMobile = useIsMobile();

  const isLocalTest = useIsLocalTest();
  const isStudioPreview = useIsStudioPreview();

  const handleBackToInbox = async () => {
    if (isStudioPreview) {
      return;
    }
    if (isLocalTest) {
      window.location.assign(window.location.origin);
      return;
    }

    const queryParameterReturnUrl = new URLSearchParams(window.location.search).get('returnUrl');
    const messageBoxUrl = returnUrlToMessagebox(window.location.origin, party?.partyId);

    if (queryParameterReturnUrl) {
      const returnUrl =
        (await httpGet<string>(getRedirectUrl(queryParameterReturnUrl)).catch((_e) => null)) ?? messageBoxUrl;
      returnUrl && window.location.assign(returnUrl);
    } else if (messageBoxUrl) {
      window.location.assign(messageBoxUrl);
    }
  };

  return (
    <nav
      className={classes.nav}
      aria-label={langAsString('navigation.main')}
    >
      <div>
        {!hideCloseButton && (
          <Button
            className={cn(classes.buttonMargin, classes.inboxButton)}
            onClick={handleBackToInbox}
            variant='tertiary'
            color='second'
          >
            <Left
              fontSize='1rem'
              aria-hidden
            />
            <Lang id={isMobile ? 'navigation.inbox' : 'navigation.back_to_inbox'} />
          </Button>
        )}
      </div>
      <PopoverNavigation wrapper={(children) => <div className={classes.wrapper}>{children}</div>}>
        {showLanguageSelector && <LanguageSelector />}
        {showExpandWidthButton && (
          <Button
            data-testid='form-expand-button'
            className={cn(classes.buttonMargin, classes.expandWidthButton)}
            onClick={toggleExpandedWidth}
            variant='tertiary'
            color='second'
            aria-label={langAsString('general.expand_form')}
            icon={true}
          >
            {expandedWidth ? (
              <FullscreenExit
                fontSize='1rem'
                style={expandIconStyle}
                aria-hidden
              />
            ) : (
              <FullscreenEnter
                fontSize='1rem'
                style={expandIconStyle}
                aria-hidden
              />
            )}
          </Button>
        )}
      </PopoverNavigation>
    </nav>
  );
};
