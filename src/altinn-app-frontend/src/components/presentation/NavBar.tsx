import * as React from 'react';
import { getLanguageFromKey } from 'altinn-shared/utils';
import { ILanguage, IAppLanguage } from 'altinn-shared/types';
import { Select } from 'altinn-shared/components';
import { Box } from '@material-ui/core';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import { useAppSelector } from 'src/common/hooks';

export interface INavBarProps {
  language: ILanguage;
  handleClose: (e: any) => void;
  handleBack: (e: any) => void;
  showBackArrow?: boolean;
  hideCloseButton?: boolean;
  showLanguageSelector?: boolean;
  appLanguages: IAppLanguage[];
  selectedAppLanguage: string;
  onAppLanguageChange: (languageCode: string) => void;
}

const NavBar = (props: INavBarProps) => {
  const textResources = useAppSelector(
    (state) => state.textResources.resources,
  );
  const language = useAppSelector((state) => state.language.language);
  const showLanguageSelect =
    props.showLanguageSelector && props.appLanguages.length > 0;
  const CloseButton = (
    <button
      type='button'
      className='a-modal-close a-js-tabable-popover ml-1'
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
      alignItems={'flex-end'}
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
          <Box display='flex' flexDirection='column' className='mb-1'>
            <label className='a-form-label' htmlFor='app-language-select'>
              {getTextFromAppOrDefault(
                'language.selector.label',
                textResources,
                language,
                null,
                true,
              )}
            </label>
            <Select
              options={props.appLanguages.map((l) => ({
                value: l.language,
                label: getTextFromAppOrDefault(
                  'language.full_name.' + l.language,
                  textResources,
                  language,
                  null,
                  true,
                ),
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
