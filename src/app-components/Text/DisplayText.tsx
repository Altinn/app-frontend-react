import React from 'react';

interface TextProps {
  value: string;
  labelId?: string;
}

export const DisplayText = ({ value, labelId }: TextProps) => (
  <>
    {labelId && <span aria-labelledby={labelId}>{value}</span>}
    {!labelId && <span>{value}</span>}
  </>
);
