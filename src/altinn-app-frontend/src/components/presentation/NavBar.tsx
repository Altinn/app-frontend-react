import * as React from 'react';
import { getLanguageFromKey } from 'altinn-shared/utils';
import { ILanguage, IAppLanguage } from 'altinn-shared/types';
import { AltinnDropdown } from 'altinn-shared/components';
import { Box } from '@material-ui/core';

export interface INavBarProps {
  language: ILanguage;
  handleClose: (e: any) => void;
  handleBack: (e: any) => void;
  showBackArrow?: boolean;
  hideCloseButton?: boolean;
  showLanguageDropdown?: boolean;
  appLanguages: IAppLanguage[];
  selectedAppLanguage: string;
  onAppLanguageChange: (languageCode: string) => void;
}

const NavBar = (props: INavBarProps) => {
  const showLanguageSelect =
    props.showLanguageDropdown && props.appLanguages.length > 0;
  const CloseButton = (
    <button
      type='button'
      className='a-modal-close a-js-tabable-popover'
      aria-label={getLanguageFromKey('general.close_schema', props.language)}
      onClick={props.handleClose}
    >
      <span className='ai-stack'>
        <i
          className='ai-stack-1x ai ai-exit  a-modal-close-icon'
          aria-hidden='true'
        />
      </span>
      <span className='hidden-button-text'>
        {getLanguageFromKey('general.close_schema', props.language)}
      </span>
    </button>
  );
  return (
    <Box
      width={'100%'}
      display='flex'
      justifyContent={'space-between'}
      className='mt-3'
    >
      <div>
        {props.showBackArrow && (
          <button
            type='button'
            className='a-modal-back a-js-tabable-popover'
            aria-label={getLanguageFromKey('general.back', props.language)}
            onClick={props.handleBack}
          >
            <span className='ai-stack'>
              <i className='ai-stack-1x ai ai-back' aria-hidden='true' />
            </span>
            <span className='hidden-button-text'>
              {getLanguageFromKey('general.back', props.language)}
            </span>
          </button>
        )}
      </div>

      <Box display='flex' alignItems={'end'}>
        {showLanguageSelect && (
          <Box mr={1} display='flex' flexDirection='column' className='mb-1'>
            <label className='a-form-label' htmlFor='app-language-select'>
              {
                props.appLanguages.find(
                  (l) => l.language === props.selectedAppLanguage,
                )?.dropdownLabel
              }
            </label>
            <AltinnDropdown
              options={props.appLanguages.map((l) => ({
                value: l.language,
                label: l.languageDescription,
              }))}
              onChange={(ev) => props.onAppLanguageChange(ev.target.value)}
              value={props.selectedAppLanguage}
              id='app-language-select'
            />
          </Box>
        )}

        {!props.hideCloseButton && CloseButton}
      </Box>
    </Box>
  );
};

export default NavBar;
