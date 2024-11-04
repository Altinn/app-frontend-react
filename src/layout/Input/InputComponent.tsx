import React from 'react';

import { Paragraph } from '@digdir/designsystemet-react';

import { FormattedInput } from 'src/app-components/Input/FormattedInput';
import { Input } from 'src/app-components/Input/Input';
import { NumericInput } from 'src/app-components/Input/NumericInput';
import { getDescriptionId } from 'src/components/label/Label';
import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsValid } from 'src/features/validation/selectors/isValid';
import { useMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/Input/InputComponent.module.css';
import { isNumberFormat, isPatternFormat } from 'src/layout/Input/number-format-helpers';
import { useCharacterLimit } from 'src/utils/inputUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { InputProps } from 'src/app-components/Input/Input';
import type { PropsFromGenericComponent } from 'src/layout';
import type {
  NumberFormatProps as NumberFormatPropsCG,
  PatternFormatProps as PatternFormatPropsCG,
} from 'src/layout/common.generated';

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

function InputOrParagraph(props: InputProps & { textOnly?: boolean }) {
  const { size: _, textOnly, prefix, suffix, type, ...customProps } = props;

  if (textOnly) {
    const { value, id, className } = customProps;
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
    <Input
      prefix={prefix}
      suffix={suffix}
      {...customProps}
      type={type}
    />
  );
}

export type IInputProps = PropsFromGenericComponent<'Input'>;

export const InputComponent: React.FunctionComponent<IInputProps> = ({ node, overrideDisplay }) => {
  const {
    id,
    readOnly,
    required,
    formatting,
    variant: inputVariant,
    textResourceBindings,
    dataModelBindings,
    saveWhileTyping,
    autocomplete,
    maxLength,
  } = useNodeItem(node);
  const isValid = useIsValid(node);
  const {
    formData: { simpleBinding: formValue },
    setValue,
  } = useDataModelBindings(dataModelBindings, saveWhileTyping);
  const debounce = FD.useDebounceImmediately();

  const { langAsString } = useLanguage();

  const reactNumberFormatConfig = useMapToReactNumberConfig(formatting, formValue);
  const ariaLabel = overrideDisplay?.renderedInTable === true ? langAsString(textResourceBindings?.title) : undefined;
  const prefixText = textResourceBindings?.prefix ? langAsString(textResourceBindings.prefix) : undefined;
  const suffixText = textResourceBindings?.suffix ? langAsString(textResourceBindings.suffix) : undefined;

  const characterLimit = useCharacterLimit(maxLength);
  const variant = getVariantWithFormat(inputVariant, reactNumberFormatConfig?.number);

  return (
    <ComponentStructureWrapper
      node={node}
      label={{
        node,
        textResourceBindings: {
          ...textResourceBindings,
          title: overrideDisplay?.renderLabel !== false ? textResourceBindings?.title : undefined,
        },
        renderLabelAs: 'label',
      }}
    >
      {(variant.type === 'search' || variant.type === 'text') && (
        <InputOrParagraph
          id={id}
          value={formValue}
          aria-label={ariaLabel}
          aria-describedby={textResourceBindings?.description ? getDescriptionId(id) : undefined}
          autoComplete={autocomplete}
          className={formatting?.align ? classes[`text-align-${formatting.align}`] : ''}
          readOnly={readOnly}
          required={required}
          onBlur={debounce}
          error={!isValid}
          textOnly={overrideDisplay?.rowReadOnly && readOnly}
          prefix={prefixText}
          suffix={suffixText}
          type={variant.type}
          characterLimit={!readOnly ? characterLimit : undefined}
          onChange={(event) => {
            setValue('simpleBinding', event.target.value);
          }}
        />
      )}
      {variant.type === 'pattern' && (
        <FormattedInput
          id={id}
          value={formValue}
          data-testid={`${id}-formatted-number-${variant}`}
          aria-label={ariaLabel}
          aria-describedby={textResourceBindings?.description ? getDescriptionId(id) : undefined}
          autoComplete={autocomplete}
          className={formatting?.align ? classes[`text-align-${formatting.align}`] : ''}
          readOnly={readOnly}
          required={required}
          onBlur={debounce}
          error={!isValid}
          {...variant.format}
          onValueChange={(values, sourceInfo) => {
            if (sourceInfo.source === 'prop') {
              return;
            }
            setValue('simpleBinding', values.value);
          }}
          prefix={prefixText}
        />
      )}
      {variant.type === 'number' && (
        <NumericInput
          id={id}
          value={formValue}
          data-testid={`${id}-formatted-number-${variant}`}
          aria-label={ariaLabel}
          aria-describedby={textResourceBindings?.description ? getDescriptionId(id) : undefined}
          autoComplete={autocomplete}
          className={formatting?.align ? classes[`text-align-${formatting.align}`] : ''}
          readOnly={readOnly}
          required={required}
          onBlur={debounce}
          error={!isValid}
          onValueChange={(values, sourceInfo) => {
            if (sourceInfo.source === 'prop') {
              // Do not update the value if the change is from props (i.e. let's not send form data updates when
              // visual-only decimalScale changes)
              return;
            }
            setValue('simpleBinding', values.value);
          }}
          onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => {
            /* This is a workaround for a react-number-format bug that
             * removes the decimal on paste.
             * We should be able to remove it when this issue gets fixed:
             * https://github.com/s-yadav/react-number-format/issues/349
             *  */
            event.preventDefault();
            const pastedText = event.clipboardData.getData('Text');
            if (pastedText.indexOf(',') !== -1) {
              setValue('simpleBinding', pastedText.replace(',', '.'));
            } else {
              setValue('simpleBinding', pastedText);
            }
          }}
          {...variant.format}
        />
      )}
    </ComponentStructureWrapper>
  );
};
