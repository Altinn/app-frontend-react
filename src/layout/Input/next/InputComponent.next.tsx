import React from 'react';

import type { CharacterLimit } from '@digdir/design-system-react/dist/types/utilities/InputWrapper';

import { Flex } from 'src/app-components/Flex/Flex';
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
// CompClassMap[Type]

//CompIntermediateExact<Type>

// The local versions of number/pattern format props
type NumberFormatProps = Omit<NumberFormatPropsCG, 'thousandSeparator' | 'decimalSeparator' | 'suffix' | 'prefix'> & {
  thousandSeparator?: boolean | string;
  decimalSeparator?: string;
  suffix?: string;
  prefix?: string;
};
type PatternFormatProps = Omit<PatternFormatPropsCG, 'format'> & {
  format: string;
};

// Discriminant unions for the input variant
type SearchVariant = { type: 'search' };
type TextVariant = { type: 'text' };
type NumberVariant = { type: 'number'; format: NumberFormatProps };
type PatternVariant = { type: 'pattern'; format: PatternFormatProps };
type Variant = SearchVariant | TextVariant | NumberVariant | PatternVariant;

// Simple helper to figure out the variant if you still want that in the parent:
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
  /** The resolved variant of the input (text/search/number/pattern) */
  variant: Variant;

  /** The current input value */
  value: string;

  /** Called whenever the user changes the input's value */
  onChange: (newValue: string) => void;

  /** Common HTML input attributes / behavior flags */
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

  /**
   * If rendered in a table or a "row read-only" scenario,
   * these can be used to adjust aria labels, styling, etc.
   */
  renderedInTable?: boolean;
  rowReadOnly?: boolean;

  /**
   * You can pass in the same object you'd normally pass
   * to `react-number-format` if it's a numeric type,
   * or your pattern config for pattern type, etc.
   */
  numberFormatProps?: NumberFormatProps;
  patternFormatProps?: PatternFormatProps;
}

/**
 * A refactored <InputVariant> component that does not rely on any internal hooks.
 * Everything it needs is passed in via props.
 */
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
  // Build the props used by <Input>, <FormattedInput>, and <NumericInput>
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
    // Any other input-related fields you'd like
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

//export const InputComponentNext = (props: PropsFromGenericComponent<'Input'>, commonProps: CommonProps) => (
// export const InputComponentNext = (component: CompIntermediateExact<'Input'>, commonProps: CommonProps) => (
export const InputComponentNext: React.FunctionComponent<InputComponentNextProps> = ({ component, commonProps }) => (
  <Label
    htmlFor={component.id}
    label={commonProps.label}
    grid={component?.grid}
    required={commonProps.required}
  >
    <Flex
      id={`form-content-${component.id}`}
      size={{ xs: 12, ...component.grid?.innerGrid }}
      item
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
      {/*<InputVariant*/}
      {/*  node={node}*/}
      {/*  overrideDisplay={props.}*/}
      {/*/>*/}
    </Flex>
  </Label>
);
