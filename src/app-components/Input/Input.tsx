import React from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { Field, Paragraph, Textfield } from '@digdir/designsystemet-react';
import type { FieldCounterProps } from '@digdir/designsystemet-react';

import classes from 'src/app-components/Input/Input.module.css';
import type { InputType } from 'src/app-components/Input/constants';

type LabelRequired =
  | { 'aria-label': string; 'aria-labelledby'?: never; label?: never }
  | { 'aria-label'?: never; 'aria-labelledby'?: never; label: ReactNode }
  | { 'aria-label'?: never; 'aria-labelledby': string; label?: never };

export type InputProps = {
  size?: 'sm' | 'md' | 'lg';
  prefix?: string;
  suffix?: string;
  characterLimit?: FieldCounterProps;
  error?: ReactNode;
  disabled?: boolean;
  id?: string;
  readOnly?: boolean;
  type?: InputType;
  textonly?: boolean;
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
> &
  LabelRequired;

export function Input(props: InputProps) {
  const { size = 'sm', readOnly, error, characterLimit, ...rest } = props;

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (readOnly) {
      event.preventDefault();
    }
  };

  if (props.textonly) {
    const { value, id, className } = props;
    if (value === null || (typeof value === 'string' && value.length === 0)) {
      return null;
    }

    return (
      <Paragraph
        id={id}
        data-size={size}
        className={`${classes.textPadding} ${classes.focusable} ${className}`}
        tabIndex={0}
      >
        {value}
      </Paragraph>
    );
  }

  return (
    <Field>
      <Textfield
        aria-invalid={!!error}
        onPaste={handlePaste}
        data-size={size}
        readOnly={readOnly}
        {...rest}
      />
      {characterLimit && <Field.Counter {...characterLimit} />}
    </Field>
  );
}
