import * as React from 'react';
import { getLanguageFromKey } from 'altinn-shared/utils';
import { ILanguage } from 'altinn-shared/types';
import { AltinnCollapsableList } from 'altinn-shared/components';
import { Grid, Typography } from '@material-ui/core';

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
  const [subUnitsExpanded, setSubUnitsExpanded] =
    React.useState<boolean>(false);
  /*const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    props.onAppLanguageChange(event.target.value);
  };*/
  function expandSubUnits() {
    setSubUnitsExpanded(!subUnitsExpanded);
  }

  return (
    <div className='a-modal-navbar'>
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
      {
        <AltinnCollapsableList
          transition={true}
          onClickExpand={expandSubUnits}
          listHeader={
            <Grid container={true} direction='row'>
              <Grid container={true} direction='row'>
                <div>
                  <i
                    className='ai ai-expand-circle'
                    style={{
                      WebkitTransition: '-webkit-transform 0.5s',
                      transition: 'transform 0.5s',
                      transform: subUnitsExpanded
                        ? 'rotate(90deg)'
                        : 'rotate(0deg)',
                      WebkitTransform: subUnitsExpanded
                        ? 'rotate(90deg)'
                        : 'rotate(0deg)',
                    }}
                  />
                </div>
                <Typography>&nbsp;Språk</Typography>
              </Grid>
            </Grid>
          }
        >
          {props.appLanguages.map((languageCode: string, index: number) => (
            <Grid key={index} container={true} direction='column'>
              <Grid
                key={index}
                container={true}
                direction='column'
                tabIndex={subUnitsExpanded ? 0 : undefined}
              >
                <Grid container={true} direction='row'>
                  <Typography>{languageCode}</Typography>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </AltinnCollapsableList>
      }
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
    </div>
  );
};

export default NavBar;
