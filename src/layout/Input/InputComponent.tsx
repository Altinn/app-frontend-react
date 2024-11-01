import React from 'react';
import { NumericFormat, PatternFormat } from 'react-number-format';
import type { NumericFormatProps, PatternFormatProps } from 'react-number-format';

import { Paragraph, Textfield } from '@digdir/designsystemet-react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { useMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import classes from 'src/layout/Input/InputComponent.module.css';
import { isNumberFormat, isPatternFormat } from 'src/layout/Input/number-format-helpers';
import { useCharacterLimit } from 'src/utils/inputUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export type IInputProps = PropsFromGenericComponent<'Input'>;

import type { TextfieldProps } from '@digdir/designsystemet-react/dist/types/components/form/Textfield/Textfield';

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

interface InputComponentProps extends Omit<TextfieldProps, 'prefix' | 'suffix'> {
  textOnly?: boolean;
  prefixText?: string;
  suffixText?: string;
}

// We need to use this wrapped Textfield component because we have a conflict between the 'size' prop
// of the TextField and the react-number-format components which also have a 'size' prop
// The prefix/suffix props from the design system also conflicts with react-number-format
const TextfieldWrapped: React.FunctionComponent<InputComponentProps> = (props) => {
  const { size: _, textOnly, prefixText, suffixText, type, ...customProps } = props;

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
    <Textfield
      size={'small'}
      prefix={prefixText}
      suffix={suffixText}
      {...customProps}
      type={type}
    />
  );
};

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
  const commonProps = {
    'aria-label': ariaLabel,
    'aria-describedby': textResourceBindings?.description ? getDescriptionId(id) : undefined,
    autoComplete: autocomplete,
    characterLimit: !readOnly ? characterLimit : undefined,
    role: 'textbox',
    className: formatting?.align ? classes[`text-align-${formatting.align}`] : '',
    id,
    readOnly,
    error: !isValid,
    required,
    onBlur: debounce,
    textOnly: overrideDisplay?.rowReadOnly && readOnly,
    prefixText,
    suffixText,
  };

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
        <TextfieldWrapped
          value={formValue}
          onChange={(event) => {
            setValue('simpleBinding', event.target.value);
          }}
          {...commonProps}
          type={variant.type}
        />
      )}
      {variant.type === 'pattern' && (
        <PatternFormat
          value={formValue}
          onValueChange={(values, sourceInfo) => {
            if (sourceInfo.source === 'prop') {
              return;
            }
            setValue('simpleBinding', values.value);
          }}
          customInput={TextfieldWrapped as React.ComponentType}
          data-testid={`${id}-formatted-number-${variant}`}
          {...variant.format}
          {...commonProps}
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
          onPaste={(event) => {
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
          customInput={TextfieldWrapped as React.ComponentType}
          data-testid={`${id}-formatted-number-${variant}`}
          {...variant.format}
          {...commonProps}
        />
      )}
    </ComponentStructureWrapper>
  );
};
