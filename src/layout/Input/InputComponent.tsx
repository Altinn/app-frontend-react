import React from 'react';
import { NumericFormat, PatternFormat } from 'react-number-format';
import type { NumericFormatProps, PatternFormatProps } from 'react-number-format';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { useMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import classes from 'src/layout/Input/InputComponent.module.css';
import { isNumberFormat, isPatternFormat } from 'src/layout/Input/number-format-helpers';
import { useCharacterLimit } from 'src/utils/inputUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export type IInputProps = PropsFromGenericComponent<'Input'>;

import { Input } from 'src/app-components/Input/Input';
import { getDescriptionId } from 'src/components/label/Label';
import { FD } from 'src/features/formData/FormDataWrite';
import { useIsValid } from 'src/features/validation/selectors/isValid';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';

type SearchVariant = { type: 'search' };
type TextVariant = { type: 'text' };
type NumberVariant = { type: 'number'; format: NumericFormatProps };
type PatternVariant = { type: 'pattern'; format: PatternFormatProps };
type Variant = SearchVariant | TextVariant | NumberVariant | PatternVariant;

function getVariantWithFormat(
  type: 'text' | 'search' | undefined,
  format: NumericFormatProps | PatternFormatProps | undefined,
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
        <Input
          value={formValue}
          onChange={(event) => {
            setValue('simpleBinding', event.target.value);
          }}
          aria-label={ariaLabel}
          aria-describedby={textResourceBindings?.description ? getDescriptionId(id) : undefined}
          autoComplete={autocomplete}
          characterLimit={!readOnly ? characterLimit : undefined}
          className={formatting?.align ? classes[`text-align-${formatting.align}`] : ''}
          id={id}
          readOnly={overrideDisplay?.rowReadOnly || readOnly}
          error={!isValid}
          required={required}
          onBlur={debounce}
          prefix={prefixText}
          suffix={suffixText}
          type={variant.type}
        />
      )}
      {variant.type === 'pattern' && (
        <PatternFormat
          id={id}
          value={formValue}
          onValueChange={(values, sourceInfo) => {
            if (sourceInfo.source === 'prop') {
              return;
            }
            setValue('simpleBinding', values.value);
          }}
          customInput={Input as React.ComponentType}
          {...variant.format}
          data-testid={`${id}-formatted-number-${variant}`}
          aria-label={ariaLabel}
          aria-describedby={textResourceBindings?.description ? getDescriptionId(id) : undefined}
          autoComplete={autocomplete}
          className={formatting?.align ? classes[`text-align-${formatting.align}`] : ''}
          readOnly={readOnly}
          required={required}
          onBlur={debounce}
          prefix={prefixText}
        />
      )}
      {variant.type === 'number' && (
        <NumericFormat
          value={formValue}
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
          customInput={Input as React.ComponentType}
          data-testid={`${id}-formatted-number-${variant}`}
          {...variant.format}
          aria-label={ariaLabel}
          aria-describedby={textResourceBindings?.description ? getDescriptionId(id) : undefined}
          autoComplete={autocomplete}
          className={formatting?.align ? classes[`text-align-${formatting.align}`] : ''}
          id={id}
          readOnly={readOnly}
          required={required}
          onBlur={debounce}
          prefix={prefixText}
        />
      )}
    </ComponentStructureWrapper>
  );
};
