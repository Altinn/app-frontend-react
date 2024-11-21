import React from 'react';

import { formatNumericText } from '@digdir/design-system-react';

import { getMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import classes from 'src/layout/Number/Number.module.css';
import type { CompInternal } from 'src/layout/layout';

type Formatting = Exclude<CompInternal<'Input'>['formatting'], undefined>;

interface NumberProps {
  value: number;
  formatting?: Formatting;
  currentLanguage?: string;
  iconUrl?: string;
  iconAltText?: string;
  labelId?: string;
}

export const Number = ({ value, formatting, iconUrl, iconAltText, labelId, currentLanguage = 'nb' }: NumberProps) => {
  const numberFormatting = getMapToReactNumberConfig(formatting, value.toString(), currentLanguage);
  const displayData = numberFormatting?.number ? formatNumericText(value.toString(), numberFormatting.number) : value;

  return (
    <>
      {iconUrl && (
        <img
          src={iconUrl}
          className={classes.icon}
          alt={iconAltText}
        />
      )}
      <span aria-labelledby={labelId}>{displayData}</span>
    </>
  );
};
