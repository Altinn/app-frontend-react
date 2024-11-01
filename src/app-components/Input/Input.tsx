import React from 'react';
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

import { Paragraph, Textfield } from '@digdir/designsystemet-react';
import type { CharacterLimitProps } from '@digdir/designsystemet-react/dist/types/components/form/CharacterCounter';

import classes from 'src/app-components/Input/Input.module.css';

type InputProps = {
  size?: 'sm' | 'md' | 'lg';
  prefix?: string;
  suffix?: string;
  type?: 'search' | 'text' | 'number';
  characterLimit?: CharacterLimitProps;
  error?: ReactNode;
  disabled?: boolean;
  id?: string;
  readOnly?: boolean;
} & Pick<HTMLAttributes<HTMLElement>, 'aria-describedby'> &
  Pick<
    InputHTMLAttributes<HTMLInputElement>,
    | 'value'
    | 'className'
    | 'aria-label'
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

  if (props.readOnly) {
    if (props.value === null || (typeof props.value === 'string' && props.value.length === 0)) {
      return null;
    }

    return (
      <Paragraph
        id={props.id}
        size='small'
        className={`${classes.textPadding} ${classes.focusable} ${props.className}`}
        tabIndex={0}
      >
        {props.value}
      </Paragraph>
    );
  }

  return (
    <Textfield
      size={size}
      {...rest}
    />
  );
}
