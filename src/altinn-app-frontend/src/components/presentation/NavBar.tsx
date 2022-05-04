import * as React from 'react';
import { getLanguageFromKey } from 'altinn-shared/utils';
import { ILanguage } from 'altinn-shared/types';
import { AltinnDropdown } from 'altinn-shared/components';
import { Box } from '@material-ui/core';

export interface INavBarProps {
  language: ILanguage;
  handleClose: (e: any) => void;
  handleBack: (e: any) => void;
  showBackArrow?: boolean;
  hideCloseButton?: boolean;
  showLanguageDropdown?: boolean;
  appLanguages: string[];
  selectedAppLanguage: string;
  onAppLanguageChange: (languageCode: string) => void;
}

const NavBar = (props: INavBarProps) => {
  return (
    <Box mt={5} width={'100%'} display='flex' justifyContent={'space-between'}>
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

      <Box display='flex'>
        <Box mr={1}>
          <AltinnDropdown
            options={props.appLanguages.map((l) => ({ label: l, value: l }))}
            onChange={(ev) => props.onAppLanguageChange(ev.target.value)}
            value={props.selectedAppLanguage}
            id='app-language-select'
          />
        </Box>

        {!props.hideCloseButton && (
          <button
            type='button'
            className='a-modal-close a-js-tabable-popover'
            aria-label={getLanguageFromKey(
              'general.close_schema',
              props.language,
            )}
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
        )}
      </Box>
    </Box>
  );
};

export default NavBar;
