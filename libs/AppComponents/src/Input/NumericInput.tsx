import React from 'react';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';

import { Input, type InputProps } from './Input';

export function NumericInput(props: Omit<NumericFormatProps, 'customInput' | 'size'> & InputProps) {
  return (
    <NumericFormat
      {...props}
      customInput={Input}
    />
  );
}
