import React from 'react';

import { Button } from '@digdir/design-system-react';
import { Close, FullscreenEnter, FullscreenExit, Left } from '@navikt/ds-icons';
import cn from 'classnames';

import { LanguageSelector } from 'src/components/presentation/LanguageSelector';
import classes from 'src/components/presentation/NavBar.module.css';
import { useUiConfigContext } from 'src/features/form/layout/UiConfigContext';
import { useLanguage } from 'src/hooks/useLanguage';
import { useNavigatePage } from 'src/hooks/useNavigatePage';

export interface INavBarProps {
  handleClose: () => void;
  handleBack: (e: any) => void;
  showBackArrow?: boolean;
}

const expandIconStyle = { transform: 'rotate(45deg)' };

export const NavBar = (props: INavBarProps) => {
  const { langAsString } = useLanguage();
  const { navigateToPage, previous } = useNavigatePage();

  const { hideCloseButton, showLanguageSelector, showExpandWidthButton, expandedWidth, toggleExpandedWidth } =
    useUiConfigContext();

  return (
    <nav
      className={classes.nav}
      aria-label={langAsString('navigation.main')}
    >
      <div>
        {props.showBackArrow && (
          <Button
            data-testid='form-back-button'
            className={classes.buttonMargin}
            onClick={() => navigateToPage(previous)}
            variant='tertiary'
            color='second'
            size='small'
            aria-label={langAsString('general.back')}
            icon={<Left aria-hidden />}
          />
        )}
      </div>

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

        {!hideCloseButton && (
          <Button
            data-testid='form-close-button'
            className={classes.buttonMargin}
            onClick={props.handleClose}
            variant='tertiary'
            color='second'
            size='small'
            aria-label={langAsString('general.close_schema')}
            icon={<Close aria-hidden />}
          />
        )}
      </div>
    </nav>
  );
};
