import React from 'react';

import { Select } from '@digdir/design-system-react';
import type { MultiSelectOption } from '@digdir/design-system-react';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { useGetOptions } from 'src/components/hooks';
import { useDelayedSavedState } from 'src/components/hooks/useDelayedSavedState';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import type { PropsFromGenericComponent } from 'src/layout';

import 'src/layout/MultipleSelect/MultipleSelect.css';

export type IMultipleSelectProps = PropsFromGenericComponent<'MultipleSelect'>;

export function MultipleSelectComponent({
  node,
  handleDataChange,
  getTextResourceAsString,
  formData,
  isValid,
}: IMultipleSelectProps) {
  const { options, optionsId, mapping, source, id, readOnly } = node.item;
  const apiOptions = useGetOptions({ optionsId, mapping, source });
  const language = useAppSelector((state) => state.language.language);
  const { value, setValue, saveValue } = useDelayedSavedState(handleDataChange, formData?.simpleBinding);

  if (!language) {
    return null;
  }

  const calculatedOptions: MultiSelectOption[] =
    (apiOptions || options)
      ?.filter((option, index, array) => !array.slice(0, index).find((found) => found.value === option.value))
      .map((option) => {
        const label = getTextResourceAsString(option.label) ?? option.value;
        return {
          label,
          value: option.value,
          deleteButtonLabel: `${getLanguageFromKey('general.delete', language)} ${label}`,
        };
      }) || [];

  const handleChange = (values: string[]) => {
    setValue(values.join(','));
  };

  const selectedValues = calculatedOptions
    ?.filter((option) => value?.split(',').includes(option.value))
    .map((option) => option.value);

  return (
    <Select
      options={calculatedOptions}
      deleteButtonLabel={getLanguageFromKey('general.delete', language)}
      multiple
      inputId={id}
      disabled={readOnly}
      error={!isValid}
      onChange={handleChange}
      onBlur={saveValue}
      value={selectedValues}
    />
  );
}
