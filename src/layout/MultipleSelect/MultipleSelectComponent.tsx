import React from 'react';

import { Select } from '@digdir/design-system-react';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { useGetOptions } from 'src/components/hooks';
import { useDelayedSavedState } from 'src/components/hooks/useDelayedSavedState';
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
  const calculatedOptions =
    (apiOptions || options)?.map((option) => ({
      label: getTextResourceAsString(option.label) ?? option.value,
      value: option.value,
    })) || [];
  const language = useAppSelector((state) => state.language.language);

  const { value, setValue /*, saveValue*/ } = useDelayedSavedState(handleDataChange, formData?.simpleBinding);

  if (!language) {
    return null;
  }

  const handleChange = (values: string[]) => {
    setValue(values.join(','));
  };

  const selectedValues = calculatedOptions
    ?.filter((option) => value?.split(',').includes(option.value))
    .map((option) => option.value);

  return (
    <Select
      options={calculatedOptions}
      multiple
      inputId={id}
      disabled={readOnly}
      error={!isValid}
      onChange={handleChange}
      //onBlur(saveValue)
      value={selectedValues}
    />
  );
}
