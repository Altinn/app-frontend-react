import * as React from 'react';
import { getLanguageFromKey } from 'altinn-shared/utils/language';
import type { ILabelIndicatorProps } from './OptionalIndicator';

export const RequiredIndicator = ({ language }: ILabelIndicatorProps) => {
  return (
    <span>
      {` ${getLanguageFromKey('form_filler.required_label', language)}`}
    </span>
  )
}
