import React from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { Textfield } from '@digdir/designsystemet-react';
import type { CharacterLimitProps } from '@digdir/designsystemet-react/dist/types/components/form/CharacterCounter';

import type { InputType } from 'src/app-components/Input/constants';

import 'src/app-components/Input/Input.module.css';

export type InputProps = {
  size?: 'sm' | 'md' | 'lg';
  prefix?: string;
  suffix?: string;
  characterLimit?: CharacterLimitProps;
  error?: ReactNode;
  disabled?: boolean;
  id?: string;
  readOnly?: boolean;
  type?: InputType;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'value'
  | 'className'
  | 'aria-label'
  | 'aria-describedby'
  | 'onChange'
  | 'autoComplete'
  | 'required'
  | 'onBlur'
  | 'placeholder'
  | 'inputMode'
  | 'style'
>;

export function Input(props: InputProps) {
  const { size = 'sm', ...rest } = props;

  return (
    <Textfield
      size={size}
      {...rest}
    />
  );
}
