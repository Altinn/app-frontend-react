import React from 'react';
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

import { Paragraph, Textfield } from '@digdir/designsystemet-react';
import type { CharacterLimitProps } from '@digdir/designsystemet-react/dist/types/components/form/CharacterCounter';

import classes from 'src/app-components/Input/Input.module.css';

type InputProps = {
  size?: 'sm' | 'md' | 'lg';
  prefix?: string;
  suffix?: string;
  type?: 'search' | 'text';
  characterLimit?: CharacterLimitProps;
  error?: ReactNode;
  disabled?: boolean;
  id?: string;
  readOnly?: boolean;
} & Pick<HTMLAttributes<HTMLElement>, 'aria-describedby'> &
  Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'className' | 'aria-label' | 'onChange' | 'autoComplete' | 'required' | 'onBlur'
  >;

export function Input(props: InputProps) {
  const {
    size = 'sm',
    prefix,
    suffix,
    type,
    characterLimit,
    error,
    disabled,
    id,
    readOnly,
    value,
    className,
    onChange,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    autoComplete,
    required,
    onBlur,
  } = props;

  if (readOnly) {
    if (value === null || (typeof value === 'string' && value.length === 0)) {
      return null;
    }

    return (
      <Paragraph
        id={id}
        size='small'
        className={`${classes.textPadding} ${classes.focusable} ${className}`}
        tabIndex={0}
      >
        {value}
      </Paragraph>
    );
  }

  return (
    <Textfield
      size={size}
      prefix={prefix}
      suffix={suffix}
      type={type}
      onChange={onChange}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      autoComplete={autoComplete}
      characterLimit={characterLimit}
      className={className}
      id={id}
      readOnly={readOnly}
      error={error}
      required={required}
      disabled={disabled}
      onBlur={onBlur}
      value={value}
    />
  );
}
