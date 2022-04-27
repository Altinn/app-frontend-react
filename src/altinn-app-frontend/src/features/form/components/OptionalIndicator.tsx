import * as React from 'react';
import type { ILanguage } from 'altinn-shared/types';
import { getLanguageFromKey } from 'altinn-shared/utils/language';

export interface ILabelIndicatorProps {
  language: ILanguage;
}

export const OptionalIndicator = ({ language }: ILabelIndicatorProps) => {
  return (
    <span className='label-optional'>
      {` (${getLanguageFromKey('general.optional', language)})`}
    </span>
  )
}
