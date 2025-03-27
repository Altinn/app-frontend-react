import React from 'react';

import type { CharacterLimit } from '@digdir/design-system-react/dist/types/utilities/InputWrapper';

import { FormattedInput } from 'src/app-components/Input/FormattedInput';
import { Input } from 'src/app-components/Input/Input';
import { NumericInput } from 'src/app-components/Input/NumericInput';
import { Label } from 'src/app-components/Label/Label';
import { isNumberFormat, isPatternFormat } from 'src/layout/Input/number-format-helpers';
import type { InputProps } from 'src/app-components/Input/Input';
import type {
  NumberFormatProps as NumberFormatPropsCG,
  PatternFormatProps as PatternFormatPropsCG,
} from 'src/layout/common.generated';
import type { CommonProps } from 'src/layout/Input';
import type { CompIntermediateExact } from 'src/layout/layout';
type NumberFormatProps = Omit<NumberFormatPropsCG, 'thousandSeparator' | 'decimalSeparator' | 'suffix' | 'prefix'> & {
  thousandSeparator?: boolean | string;
  decimalSeparator?: string;
  suffix?: string;
  prefix?: string;
};
type PatternFormatProps = Omit<PatternFormatPropsCG, 'format'> & {
  format: string;
};

type SearchVariant = { type: 'search' };
type TextVariant = { type: 'text' };
type NumberVariant = { type: 'number'; format: NumberFormatProps };
type PatternVariant = { type: 'pattern'; format: PatternFormatProps };
type Variant = SearchVariant | TextVariant | NumberVariant | PatternVariant;

export function getVariantWithFormat(
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

// Props to be passed in from the parent
export interface InputVariantProps {
  variant: Variant;

  value: string;

  onChange: (newValue: string) => void;

  id: string;
  readOnly?: boolean;
  required?: boolean;
  autoComplete?: string;
  error?: boolean;
  characterLimit?: CharacterLimit;
  className?: string;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;

  renderedInTable?: boolean;
  rowReadOnly?: boolean;

  numberFormatProps?: NumberFormatProps;
  patternFormatProps?: PatternFormatProps;
}

export const InputVariant: React.FC<InputVariantProps> = ({
  variant,
  value,
  onChange,
  id,
  readOnly,
  required,
  autoComplete,
  error,
  characterLimit,
  className,
  prefix,
  suffix,
  style,
  renderedInTable,
  rowReadOnly,
  numberFormatProps,
  patternFormatProps,
}) => {
  const inputProps: InputProps = {
    id,
    'aria-label': renderedInTable ? undefined : undefined, // Adjust as needed if you'd like
    readOnly,
    textonly: rowReadOnly && readOnly,
    required,
    error,
    autoComplete,
    prefix,
    suffix,
    characterLimit: !readOnly ? characterLimit : undefined,
    className,
    style: style ?? { width: '100%' },
  };

  switch (variant.type) {
    case 'search':
      return (
        <Input
          {...inputProps}
          value={value}
          type='search'
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case 'text':
      return (
        <Input
          {...inputProps}
          value={value}
          type='text'
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case 'pattern': {
      const format = patternFormatProps ?? variant.format;
      return (
        <FormattedInput
          {...inputProps}
          {...format}
          type='text'
          value={value}
          onValueChange={(values, sourceInfo) => {
            if (sourceInfo.source === 'prop') {
              return;
            }
            onChange(values.value);
          }}
        />
      );
    }

    case 'number': {
      const format = numberFormatProps ?? variant.format;
      return (
        <NumericInput
          {...inputProps}
          {...format}
          type='text'
          value={value}
          onValueChange={(values, sourceInfo) => {
            if (sourceInfo.source === 'prop') {
              return;
            }
            onChange(values.value);
          }}
          onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => {
            /* This is a workaround for a react-number-format bug that
             * removes the decimal on paste. You can remove/adjust it if it's fixed.
             */
            event.preventDefault();
            if (readOnly) {
              return;
            }
            const pastedText = event.clipboardData.getData('Text');
            if (pastedText.indexOf(',') !== -1) {
              onChange(pastedText.replace(',', '.'));
            } else {
              onChange(pastedText);
            }
          }}
        />
      );
    }

    default:
      return null; // Should never happen if the variant type is well-defined
  }
};

interface InputComponentNextProps {
  component: CompIntermediateExact<'Input'>;
  commonProps: CommonProps;
}

export const InputComponentNext: React.FunctionComponent<InputComponentNextProps> = ({ component, commonProps }) => (
  <Label
    htmlFor={component.id}
    label={commonProps.label}
    grid={component?.grid}
    required={false}
  >
    <InputVariant
      id={component.id}
      variant={{
        type: 'search',
      }}
      value={commonProps.currentValue || ''}
      onChange={function (newValue: string): void {
        commonProps.onChange(newValue);
      }}
    />
  </Label>
);
