import React from 'react';
import { PatternFormat } from 'react-number-format';
import type { PatternFormatProps } from 'react-number-format';

import type { InputProps } from '@material-ui/core';

import { Input } from 'src/app-components/Input/Input';

export function FormattedInput(props: Omit<PatternFormatProps, 'customInput' | 'size'> & InputProps) {
  return (
    <PatternFormat
      {...props}
      customInput={Input}
    />
  );
}
