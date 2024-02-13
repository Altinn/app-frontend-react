import React, { useCallback, useEffect, useState } from 'react';
import { numericFormatter, patternFormatter, removeNumericFormat, removePatternFormat } from 'react-number-format';
import type { NumericFormatProps, PatternFormatProps } from 'react-number-format';

import { SearchField } from '@altinn/altinn-design-system';
import { Textfield } from '@digdir/design-system-react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { useMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { useRerender } from 'src/hooks/useReload';
import { useCharacterLimit } from 'src/utils/inputUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IInputFormatting, NumberFormatProps } from 'src/layout/Input/config.generated';

export type IInputProps = PropsFromGenericComponent<'Input'>;

function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

const getChangeMeta = (newValue: string) => ({
  from: { start: 0, end: 0 },
  to: { start: 0, end: newValue.length },
  lastValue: '',
});

const getCleanValue = (newValue: string, inputFormatting: IInputFormatting) => {
  if (isNumericFormat(inputFormatting)) {
    return removeNumericFormat(newValue, getChangeMeta(newValue), {
      ...inputFormatting,
    });
  }
  return removePatternFormat(newValue, getChangeMeta(newValue), {
    ...(inputFormatting as PatternFormatProps),
  });
};

const getFormattedValue = (newValue: string, inputFormatting: IInputFormatting): string => {
  const cleanedValue = getCleanValue(newValue, inputFormatting);

  if (isNumericFormat(inputFormatting) && inputFormatting.number) {
    if ((inputFormatting.number as NumberFormatProps).allowedDecimalSeparators) {
      return numericFormatter(cleanedValue, inputFormatting);
    }

    return numericFormatter(cleanedValue, inputFormatting.number);
  }

  if (isPatternFormat(inputFormatting) && !isEmptyObject(inputFormatting)) {
    return patternFormatter(cleanedValue, inputFormatting);
  }
  return newValue;
};

export const isPatternFormat = (
  numberFormat: NumericFormatProps | PatternFormatProps,
): numberFormat is PatternFormatProps => (numberFormat as PatternFormatProps).format !== undefined;
export const isNumericFormat = (
  numberFormat: NumericFormatProps | PatternFormatProps,
): numberFormat is NumericFormatProps => (numberFormat as PatternFormatProps).format === undefined;
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

  const [localValue, setLocalValue] = useState<string>();
  const reactNumberFormatConfig = useMapToReactNumberConfig(formatting as IInputFormatting | undefined, formValue);
  const [inputKey, rerenderInput] = useRerender('input');

  const onBlur = useCallback(() => {
    if (reactNumberFormatConfig.number) {
      rerenderInput();
    }
    debounce();
  }, [debounce, reactNumberFormatConfig.number, rerenderInput]);

  const ariaLabel = overrideDisplay?.renderedInTable === true ? langAsString(textResourceBindings?.title) : undefined;

  useEffect(() => {
    valueChanged(formValue);
  });
  const valueChanged = (newValue: string) => {
    if (!formatting) {
      setLocalValue(newValue);
      setValue('simpleBinding', newValue);
      return;
    }
    setLocalValue(getFormattedValue(newValue, formatting));
    setValue('simpleBinding', getCleanValue(newValue, formatting));
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
      value={localValue}
      aria-label={ariaLabel}
      aria-describedby={textResourceBindings?.description ? `description-${id}` : undefined}
      autoComplete={autocomplete}
    />
  );
}
