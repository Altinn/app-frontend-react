import React from 'react';

import classes from 'src/app-components/Text/Text.module.css';

interface TextProps {
  value: string;
  iconUrl?: string;
  iconAltText?: string;
  labelId?: string;
}

export const DisplayText = ({ value, labelId }: Pick<TextProps, 'value' | 'labelId'>) => (
  <>
    {labelId && <span aria-labelledby={labelId}>{value}</span>}
    {!labelId && <span>{value}</span>}
  </>
);
