import React from 'react';

import { Button } from '@digdir/design-system-react';
import { Close, FullscreenEnter, FullscreenExit, Left } from '@navikt/ds-icons';
import cn from 'classnames';

import { LanguageSelector } from 'src/components/presentation/LanguageSelector';
import classes from 'src/components/presentation/NavBar.module.css';
import { useHasApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { usePageNavigationContext } from 'src/features/form/layout/PageNavigationContext';
import { useUiConfigContext } from 'src/features/form/layout/UiConfigContext';
import { useLanguage } from 'src/features/language/useLanguage';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { PresentationType, ProcessTaskType } from 'src/types';
import { httpGet } from 'src/utils/network/networking';
import { getRedirectUrl } from 'src/utils/urls/appUrlHelper';
import { returnUrlFromQueryParameter, returnUrlToMessagebox } from 'src/utils/urls/urlHelper';

export interface INavBarProps {
  type: PresentationType | ProcessTaskType;
}

interface IInnerNavBarProps extends INavBarProps {
  showBackArrow?: boolean;
  handleClose?: () => void;
  handleBack?: (e: any) => void;
  BackButton?: React.ReactNode;
  CloseButton?: React.ReactNode;
}

const expandIconStyle = { transform: 'rotate(45deg)' };

export const NavBar = ({ type }: INavBarProps) => {
  const hasApplicationMetadata = useHasApplicationMetadata();
  if (hasApplicationMetadata) {
    return <NavBarWithNavigation type={type} />;
  }
  return <NavBarWithoutNavigation type={type} />;
};

const NavBarWithoutNavigation = ({ type }: INavBarProps) => <InnerNavBar type={type} />;

const NavBarWithNavigation = ({ type }: INavBarProps) => {
  const { langAsString } = useLanguage();
  const { navigateToPage, previous } = useNavigatePage();
  const { returnToView } = usePageNavigationContext();
  const party = useCurrentParty();

  const handleBackArrowButton = () => {
    if (returnToView) {
      navigateToPage(returnToView);
    } else if (previous !== undefined && (type === ProcessTaskType.Data || type === PresentationType.Stateless)) {
      navigateToPage(previous);
    }
  };

  const handleModalCloseButton = () => {
    const queryParameterReturnUrl = returnUrlFromQueryParameter();
    const messageBoxUrl = returnUrlToMessagebox(window.location.origin, party?.partyId);
    if (!queryParameterReturnUrl && messageBoxUrl) {
      window.location.href = messageBoxUrl;
      return;
    }

    if (queryParameterReturnUrl) {
      httpGet(getRedirectUrl(queryParameterReturnUrl))
        .then((response) => response)
        .catch(() => messageBoxUrl)
        .then((returnUrl) => {
          window.location.href = returnUrl;
        });
    }
  };
  return (
    <InnerNavBar
      showBackArrow={!!previous && (type === ProcessTaskType.Data || type === PresentationType.Stateless)}
      BackButton={
        <Button
          data-testid='form-back-button'
          className={classes.buttonMargin}
          onClick={handleBackArrowButton}
          variant='tertiary'
          color='second'
          size='small'
          aria-label={langAsString('general.back')}
          icon={<Left aria-hidden />}
        />
      }
      CloseButton={
        <Button
          data-testid='form-close-button'
          className={classes.buttonMargin}
          onClick={handleModalCloseButton}
          variant='tertiary'
          color='second'
          size='small'
          aria-label={langAsString('general.close_schema')}
          icon={<Close aria-hidden />}
        />
      }
      type={type}
    />
  );
};

const InnerNavBar = ({ BackButton, CloseButton, showBackArrow }: IInnerNavBarProps) => {
  const { langAsString } = useLanguage();

  const { hideCloseButton, showLanguageSelector, showExpandWidthButton, expandedWidth, toggleExpandedWidth } =
    useUiConfigContext();

  return (
    <nav
      className={classes.nav}
      aria-label={langAsString('navigation.main')}
    >
      <div>{showBackArrow && BackButton}</div>
      <div className={classes.wrapper}>
        {showLanguageSelector && <LanguageSelector />}

        {showExpandWidthButton && (
          <Button
            data-testid='form-expand-button'
            className={cn(classes.buttonMargin, { [classes.hideExpandButtonMaxWidth]: !expandedWidth })}
            onClick={toggleExpandedWidth}
            variant='tertiary'
            color='second'
            size='small'
            aria-label={langAsString('general.expand_form')}
            icon={
              expandedWidth ? (
                <FullscreenExit
                  style={expandIconStyle}
                  aria-hidden
                />
              ) : (
                <FullscreenEnter
                  style={expandIconStyle}
                  aria-hidden
                />
              )
            }
          />
        )}
        {!hideCloseButton && CloseButton}
      </div>
    </nav>
  );
};
