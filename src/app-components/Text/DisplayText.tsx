import React from 'react';

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
