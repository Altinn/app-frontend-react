import React from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { Paragraph, Textfield } from '@digdir/designsystemet-react';
import type { CharacterLimitProps } from '@digdir/designsystemet-react/dist/types/components/form/CharacterCounter';

import classes from 'src/app-components/Input/Input.module.css';
import type { InputType } from 'src/app-components/Input/constants';

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
>;

export function Input(props: InputProps) {
  const {
    size = 'sm',
    prefix,
    suffix,
    characterLimit,
    error,
    disabled,
    id,
    readOnly,
    type,
    value,
    className,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    onChange,
    onBlur,
    autoComplete,
    required,
    placeholder,
    inputMode,
    style,
    textonly,
  } = props;

  if (textonly) {
    if (value === null || (typeof value === 'string' && value.length === 0)) {
      return null;
    }

    return (
      <Paragraph
        id={id}
        size={size}
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
      characterLimit={characterLimit}
      error={error}
      id={id}
      readOnly={readOnly}
      disabled={disabled}
      value={value}
      className={className}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      onChange={onChange}
      onBlur={onBlur}
      autoComplete={autoComplete}
      required={required}
      placeholder={placeholder}
      inputMode={inputMode}
      style={style}
    />
  );
}
