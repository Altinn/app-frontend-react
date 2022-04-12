/* eslint-disable react/prop-types */
import * as React from 'react';
import { ILabelSettings } from 'src/types';
import { getLanguageFromKey } from 'altinn-shared/utils';
import Description from './Description';
import { HelpTextContainer } from './HelpTextContainer';
import { ILanguage } from 'altinn-shared/types';

export interface IFormLegendProps {
  labelText: React.ReactNode;
  descriptionText: React.ReactNode;
  language: ILanguage;
  required?: boolean;
  labelSettings?: ILabelSettings;
  helpText: React.ReactNode;
  id: string;
}

export default function Legend(props: IFormLegendProps) {
  if (!props.labelText) {
    return null;
  }

  return (
    <>
      <label
        className='a-form-label title-label'
        htmlFor={props.id}
      >
        {props.labelText}
         {/* Mark required fields */}
          {props.required ? (
            <span className='label-optional'>
              {` ${getLanguageFromKey('form_filler.required_label', props.language)}`}
            </span>
          ) : null}
          {/* Mark optional fields only if optionalIndicator===true */}
          {props.labelSettings?.optionalIndicator && !props.required ? (
            <span className='label-optional' data-testid='optional-label'>
              {` (${getLanguageFromKey('general.optional', props.language)})`}
            </span>
          ) : null}
        {props.helpText &&
          <HelpTextContainer
            language={props.language}
            helpText={props.helpText}
          />
        }
      </label>
      {props.descriptionText &&
        <Description
          description={props.descriptionText}
          {...props}
        />
      }
    </>
  );
}
