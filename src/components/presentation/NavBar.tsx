import React from 'react';

import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';
import { Close, FullscreenEnter, FullscreenExit, Left } from '@navikt/ds-icons';

import { useAppDispatch } from 'src/common/hooks/useAppDispatch';
import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { LanguageSelector } from 'src/components/presentation/LanguageSelector';
import css from 'src/components/presentation/NavBar.module.css';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { getLanguageFromKey } from 'src/language/sharedLanguage';

export interface INavBarProps {
  handleClose: () => void;
  handleBack: (e: any) => void;
  showBackArrow?: boolean;
}

const expandIconStyle = { transform: 'rotate(45deg)' };

export const NavBar = (props: INavBarProps) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.language.language || {});
  const { hideCloseButton, showLanguageSelector, showExpandWidthButton, expandedWidth } = useAppSelector(
    (state) => state.formLayout.uiConfig,
  );

  const handleExpand = React.useCallback(() => {
    dispatch(FormLayoutActions.toggleExpandedWidth());
  }, [dispatch]);

  return (
    <nav className={css.nav}>
      <div>
        {props.showBackArrow && (
          <Button
            data-testid='form-back-button'
            onClick={props.handleBack}
            variant={ButtonVariant.Quiet}
            color={ButtonColor.Secondary}
            icon={<Left aria-label={getLanguageFromKey('general.back', language)} />}
          />
        )}
      </div>

      <div className={css.wrapper}>
        {showLanguageSelector && <LanguageSelector />}

        {showExpandWidthButton && (
          <Button
            data-testid='form-expand-button'
            onClick={handleExpand}
            variant={ButtonVariant.Quiet}
            color={ButtonColor.Secondary}
            icon={
              expandedWidth ? (
                <FullscreenExit
                  style={expandIconStyle}
                  aria-label={getLanguageFromKey('general.expand_form', language)}
                />
              ) : (
                <FullscreenEnter
                  style={expandIconStyle}
                  aria-label={getLanguageFromKey('general.expand_form', language)}
                />
              )
            }
          />
        )}

        {!hideCloseButton && (
          <Button
            data-testid='form-close-button'
            onClick={props.handleClose}
            variant={ButtonVariant.Quiet}
            color={ButtonColor.Secondary}
            icon={<Close aria-label={getLanguageFromKey('general.close_schema', language)} />}
          />
        )}
      </div>
    </nav>
  );
};
