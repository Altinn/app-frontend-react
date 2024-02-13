import React, { useCallback } from 'react';

import { SearchField } from '@altinn/altinn-design-system';
import { Textfield } from '@digdir/design-system-react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { useMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { useRerender } from 'src/hooks/useReload';
import { getCleanValue, getFormattedValue } from 'src/layout/Input/number-format-helpers';
import { useCharacterLimit } from 'src/utils/inputUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IInputFormatting } from 'src/layout/Input/config.generated';

export type IInputProps = PropsFromGenericComponent<'Input'>;

export function InputComponent({ node, isValid, overrideDisplay }: IInputProps) {
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
  const characterLimit = useCharacterLimit(maxLength);
  const { langAsString } = useLanguage();
  const {
    formData: { simpleBinding: formValue },
    setValue,
    debounce,
  } = useDataModelBindings(dataModelBindings, saveWhileTyping);

  const reactNumberFormatConfig = useMapToReactNumberConfig(formatting as IInputFormatting | undefined, formValue);

  const [inputKey, rerenderInput] = useRerender('input');

  const onBlur = useCallback(() => {
    if (reactNumberFormatConfig.number) {
      rerenderInput();
    }
    debounce();
  }, [debounce, reactNumberFormatConfig.number, rerenderInput]);

  const ariaLabel = overrideDisplay?.renderedInTable === true ? langAsString(textResourceBindings?.title) : undefined;

  const valueChanged = (newValue: string) => {
    setValue('simpleBinding', getCleanValue(newValue, reactNumberFormatConfig));
  };

  if (variant === 'search') {
    return (
      <SearchField
        id={id}
        value={formValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue('simpleBinding', e.target.value)}
        onBlur={onBlur}
        disabled={readOnly}
        aria-label={ariaLabel}
        aria-describedby={textResourceBindings?.description ? `description-${id}` : undefined}
      ></SearchField>
    );
  }

  return (
    <Textfield
      error={!isValid}
      key={inputKey}
      id={id}
      onBlur={onBlur}
      onChange={(e) => valueChanged(e.target.value)}
      characterLimit={!readOnly ? characterLimit : undefined}
      readOnly={readOnly}
      required={required}
      value={getFormattedValue(formValue, reactNumberFormatConfig)}
      aria-label={ariaLabel}
      aria-describedby={textResourceBindings?.description ? `description-${id}` : undefined}
      autoComplete={autocomplete}
    />
  );
}
