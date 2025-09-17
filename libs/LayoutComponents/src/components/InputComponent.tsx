import React, { useMemo, useState } from 'react';

import { FormattedInput, Input, NumericInput } from 'libs/AppComponents';
import type { InputProps } from 'libs/AppComponents';
import type { FormEngineComponentContext } from 'libs/FormEngineReact/components';

// Types for input formatting
type NumberFormatProps = {
  thousandSeparator?: boolean | string;
  decimalSeparator?: string;
  suffix?: string;
  prefix?: string;
  allowNegative?: boolean;
  decimalScale?: number;
  fixedDecimalScale?: boolean;
};

type PatternFormatProps = {
  format: string;
  mask?: string;
};

type SearchVariant = { type: 'search' };
type TextVariant = { type: 'text' };
type NumberVariant = { type: 'number'; format: NumberFormatProps };
type PatternVariant = { type: 'pattern'; format: PatternFormatProps };
type Variant = SearchVariant | TextVariant | NumberVariant | PatternVariant;

interface InputComponentProps {
  formEngine: FormEngineComponentContext;
}

// Helper functions for input variants
function isNumberFormat(format: any): format is NumberFormatProps {
  return (
    format &&
    (format.thousandSeparator !== undefined || format.decimalScale !== undefined || format.allowNegative !== undefined)
  );
}

function isPatternFormat(format: any): format is PatternFormatProps {
  return format && typeof format.format === 'string';
}

function getVariantWithFormat(
  type: 'text' | 'search' | undefined,
  format: NumberFormatProps | PatternFormatProps | undefined,
): Variant {
  if (type === 'search') {
    return { type: 'search' };
  }
  if (isPatternFormat(format)) {
    return { type: 'pattern', format };
  }
  if (isNumberFormat(format)) {
    return { type: 'number', format };
  }
  return { type: 'text' };
}

function getMobileKeyboardProps(
  variant: Variant,
  autocomplete: string | undefined,
): Pick<InputProps, 'inputMode' | 'pattern'> {
  if (variant.type === 'search') {
    return { inputMode: 'search', pattern: undefined };
  }

  if (autocomplete === 'email') {
    return { inputMode: 'email', pattern: undefined };
  }

  if (autocomplete === 'url' || autocomplete === 'photo') {
    return { inputMode: 'url', pattern: undefined };
  }

  if (autocomplete === 'tel') {
    return { inputMode: 'tel', pattern: '[-+()0-9]*' };
  }

  if (variant.type === 'pattern') {
    return { inputMode: 'numeric', pattern: undefined };
  }

  if (variant.type === 'number') {
    if (variant.format.allowNegative === false) {
      return { inputMode: 'decimal', pattern: `[0-9,.]*` };
    }

    if (navigator?.platform && /iPhone|iPad/.test(navigator.platform)) {
      return { inputMode: 'text', pattern: `-?[0-9,.]*` };
    }

    return { inputMode: 'decimal', pattern: `-?[0-9,.]*` };
  }

  return { inputMode: 'text', pattern: undefined };
}

function InputComponentBase({ formEngine }: InputComponentProps) {
  const { value, updateValue, errors, isValid, isRequired, isReadOnly, config } = formEngine;

  const [localValue, setLocalValue] = useState<string | undefined>(undefined);
  const formValue = localValue ?? value;

  // Determine input variant and properties
  const variant = useMemo(() => {
    const inputVariant = config.variant;
    const formatting = config.formatting;
    return getVariantWithFormat(inputVariant, formatting);
  }, [config.variant, config.formatting]);

  const { inputMode, pattern } = getMobileKeyboardProps(variant, config.autocomplete);

  // Common input props
  const commonInputProps: InputProps = {
    id: config.id,
    'aria-label': config.textResourceBindings?.title || config.id,
    'aria-describedby':
      [
        errors.length > 0 ? `${config.id}-errors` : '',
        config.textResourceBindings?.help ? `${config.id}-help` : '',
        config.textResourceBindings?.description ? `${config.id}-description` : '',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
    autoComplete: config.autocomplete,
    className: config.formatting?.align ? `text-align-${config.formatting.align}` : '',
    readOnly: isReadOnly,
    required: isRequired,
    onBlur: () => {
      setLocalValue(undefined);
    },
    error: !isValid ? errors.join(', ') : undefined,
    prefix: config.textResourceBindings?.prefix,
    suffix: config.textResourceBindings?.suffix,
    style: { width: '100%' },
    inputMode,
    pattern,
    maxLength: config.maxLength,
    placeholder: config.textResourceBindings?.placeholder,
  };

  // Render different input types
  const renderInput = () => {
    switch (variant.type) {
      case 'search':
      case 'text':
        return (
          <Input
            {...commonInputProps}
            value={formValue || ''}
            type={variant.type}
            onChange={(event) => {
              updateValue(event.target.value);
            }}
          />
        );
      case 'pattern':
        return (
          <FormattedInput
            {...commonInputProps}
            {...variant.format}
            value={formValue || ''}
            type='text'
            onValueChange={(values, sourceInfo) => {
              if (sourceInfo.source === 'prop') {
                return;
              }
              updateValue(values.value);
            }}
          />
        );
      case 'number':
        return (
          <NumericInput
            {...commonInputProps}
            {...variant.format}
            value={formValue || ''}
            type='text'
            onBlur={() => {
              setLocalValue(undefined);
            }}
            onValueChange={(values, sourceInfo) => {
              if (sourceInfo.source === 'prop') {
                return;
              }

              // Handle temporary local value for number formatting
              const noZeroesAfterComma = values.value.replace(/[.,]0+$/, '');
              const numericValue = parseFloat(values.value);

              // If the value has trailing zeros but is still valid, keep local state
              if (
                !isNaN(numericValue) &&
                values.value !== numericValue.toString() &&
                noZeroesAfterComma === numericValue.toString()
              ) {
                setLocalValue(values.value);
              } else {
                setLocalValue(undefined);
              }

              updateValue(values.value);
            }}
            onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => {
              event.preventDefault();
              if (commonInputProps.readOnly) {
                return;
              }
              const pastedText = event.clipboardData.getData('Text');
              if (pastedText.indexOf(',') !== -1) {
                updateValue(pastedText.replace(',', '.'));
              } else {
                updateValue(pastedText);
              }
            }}
          />
        );
    }
  };

  return (
    <div
      className='input-component'
      data-component-id={config.id}
      data-testid='Input'
      style={{ marginBottom: '16px' }}
    >
      {renderInput()}
    </div>
  );
}

// Export the component directly - FormEngine integration is handled via props
export const InputComponent: React.FC<{ formEngine: FormEngineComponentContext }> = InputComponentBase;
