import React, { useCallback } from 'react';
import { NumericFormat, PatternFormat } from 'react-number-format';

import { SearchField } from '@altinn/altinn-design-system';
import { Textfield } from '@digdir/design-system-react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { useMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { useRerender } from 'src/hooks/useReload';
import classes from 'src/layout/Input/InputComponent.module.css';
import { isNumericFormat, isPatternFormat } from 'src/layout/Input/number-format-helpers';
import { useCharacterLimit } from 'src/utils/inputUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IInputFormatting } from 'src/layout/Input/config.generated';

export type IInputProps = PropsFromGenericComponent<'Input'>;

export const InputComponent: React.FunctionComponent<IInputProps> = ({ node, isValid, overrideDisplay }) => {
  const {
    id,
    readOnly,
    required,
    formatting,
    variant,
    textResourceBindings,
    dataModelBindings,
    saveWhileTyping,
    autocomplete,
    maxLength,
  } = node.item;

  const {
    formData: { simpleBinding: formValue },
    setValue,
    debounce,
  } = useDataModelBindings(dataModelBindings, saveWhileTyping);

  const { langAsString } = useLanguage();

  const reactNumberFormatConfig = useMapToReactNumberConfig(formatting as IInputFormatting | undefined, formValue);
  const ariaLabel = overrideDisplay?.renderedInTable === true ? langAsString(textResourceBindings?.title) : undefined;
  const [inputKey, rerenderInput] = useRerender('input');

  const onBlur = useCallback(() => {
    if (reactNumberFormatConfig.number) {
      rerenderInput();
    }
    debounce();
  }, [debounce, reactNumberFormatConfig.number, rerenderInput]);

  const characterLimit = useCharacterLimit(maxLength);

  const commonProps = {
    'aria-label': ariaLabel,
    'aria-describedby': textResourceBindings?.description ? `description-${id}` : undefined,
    autoComplete: autocomplete,
    characterLimit: !readOnly ? characterLimit : undefined,
    role: 'textbox',
    className: reactNumberFormatConfig.align ? classes[`text-align-${reactNumberFormatConfig.align}`] : '',
    id,
    readOnly,
    isValid,
    required,
    disabled: readOnly,
  };

  if (variant === 'search') {
    return (
      <SearchField
        id={id}
        key={inputKey}
        value={formValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue('simpleBinding', e.target.value)}
        onBlur={onBlur}
        disabled={readOnly}
        aria-label={ariaLabel}
        aria-describedby={textResourceBindings?.description ? `description-${id}` : undefined}
        data-testid={`${id}-${variant}`}
      />
    );
  }

  if (!reactNumberFormatConfig?.number) {
    return (
      <Textfield
        key={inputKey}
        value={formValue}
        onChange={(event) => {
          setValue('simpleBinding', event.target.value);
        }}
        data-testid={`${id}-${variant}`}
        {...commonProps}
      />
    );
  }

  if (isPatternFormat(reactNumberFormatConfig.number)) {
    return (
      <PatternFormat
        key={inputKey}
        value={formValue}
        onValueChange={(values, sourceInfo) => {
          setValue('simpleBinding', values.value);
        }}
        customInput={Textfield as React.ComponentType}
        data-testid={`${id}-formatted-number-${variant}`}
        {...reactNumberFormatConfig.number}
        {...commonProps}
      />
    );
  }

  if (isNumericFormat(reactNumberFormatConfig.number)) {
    return (
      <NumericFormat
        key={inputKey}
        value={formValue}
        onValueChange={(values, sourceInfo) => {
          if (values.value !== formValue) {
            setValue('simpleBinding', values.value);
          }
        }}
        onPaste={(event) => {
          /* This is a workaround for a react-number-format bug that
           * removes the decimal on paste.
           * We should be able to remove it when this issue gets fixed:
           * https://github.com/s-yadav/react-number-format/issues/349
           *  */
          const pastedText = event.clipboardData.getData('Text');
          event.preventDefault();
          setValue('simpleBinding', pastedText);
        }}
        customInput={Textfield as React.ComponentType}
        data-testid={`${id}-formatted-number-${variant}`}
        {...reactNumberFormatConfig.number}
        {...commonProps}
      />
    );
  }
};
