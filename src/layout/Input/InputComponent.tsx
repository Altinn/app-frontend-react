import React from 'react';

import { SearchField } from '@altinn/altinn-design-system';
import { TextField } from '@digdir/design-system-react';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { useDelayedSavedState } from 'src/hooks/useDelayedSavedState';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IInputFormatting } from 'src/layout/layout';

export type IInputProps = PropsFromGenericComponent<'Input'>;

export function InputComponent({ node, isValid, formData, handleDataChange }: IInputProps) {
  const { id, readOnly, required, formatting, variant, textResourceBindings, saveWhileTyping, autocomplete } =
    node.item;
  const { value, setValue, saveValue, onPaste } = useDelayedSavedState(
    handleDataChange,
    formData?.simpleBinding ?? '',
    saveWhileTyping,
  );

  type SeparatorResult = {
    decimalSeparator: string | undefined;
    thousandSeparator: string | undefined;
  };

  const getSeparator = (locale: string, getSeparatorFromNumber: string | undefined): SeparatorResult => {
    const defaultSeparator = { decimalSeparator: undefined, thousandSeparator: undefined };

    if (!getSeparatorFromNumber) {
      return defaultSeparator;
    }

    const extractPartsFromIntl = (part: string) =>
      new Intl.NumberFormat(locale).formatToParts(parseFloat(getSeparatorFromNumber)).find((p) => p.type === part)
        ?.value;
    //Thousand separator is called group
    const partsMap: Record<string, keyof typeof defaultSeparator> = {
      group: 'thousandSeparator',
      decimal: 'decimalSeparator',
    };
    const parts = ['group', 'decimal'];
    let separators = { ...defaultSeparator };
    parts.forEach((part) => {
      separators = {
        ...separators,
        [partsMap[part]]: extractPartsFromIntl(part),
      };
    });

    return separators;
  };
  const allowAutoFormatting = true;
  const lang = useAppSelector((state) => state.textResources.language);
  let formattingToUse = { ...formatting };
  if (formatting?.number && allowAutoFormatting) {
    const { thousandSeparator, decimalSeparator } = getSeparator(lang || 'nb', value);
    formattingToUse = { ...formattingToUse, number: { thousandSeparator, decimalSeparator } };
  }

  const handleChange = (e) => setValue(e.target.value);
  return (
    <>
      {variant === 'search' ? (
        <SearchField
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={saveValue}
          onPaste={onPaste}
          disabled={readOnly}
          aria-describedby={textResourceBindings?.description ? `description-${id}` : undefined}
        ></SearchField>
      ) : (
        <TextField
          id={id}
          onBlur={saveValue}
          onChange={handleChange}
          onPaste={onPaste}
          readOnly={readOnly}
          isValid={isValid}
          required={required}
          value={value}
          aria-describedby={textResourceBindings?.description ? `description-${id}` : undefined}
          formatting={formattingToUse as IInputFormatting}
          autoComplete={autocomplete}
        />
      )}
    </>
  );
}
