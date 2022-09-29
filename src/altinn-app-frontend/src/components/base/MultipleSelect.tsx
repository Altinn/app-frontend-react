import React from 'react';
import Select from 'react-select';
import type { MultiValue } from 'react-select';

import type { IComponentProps } from '..';

import { useGetOptions } from 'src/components/hooks';
import type { ILayoutCompMultipleSelect } from 'src/features/form/layout';
import type { IOption } from 'src/types';

import 'src/components/base/MultipleSelect.css';

const multipleSelectCssPrefix = 'multipleSelect';
const invalidBorderColor = '#D5203B !important';

export type IMultipleSelectProps = IComponentProps &
  Omit<ILayoutCompMultipleSelect, 'type'>;

export function MultipleSelect({
  options,
  optionsId,
  mapping,
  source,
  handleDataChange,
  formData,
  id,
  readOnly,
  isValid,
}: IMultipleSelectProps) {
  const apiOptions = useGetOptions({ optionsId, mapping, source });
  const calculatedOptions = apiOptions || options;

  const handleChange = (newValue: MultiValue<IOption>) => {
    handleDataChange(newValue.map((option) => option.value).join(','));
  };

  return (
    <Select
      options={calculatedOptions}
      isMulti
      inputId={id}
      isDisabled={readOnly}
      classNamePrefix={multipleSelectCssPrefix}
      className={multipleSelectCssPrefix}
      styles={{
        control: (base) => ({
          ...base,
          ...controlStylesHasError(!isValid),
        }),
      }}
      onChange={handleChange}
      value={options?.filter((option) =>
        formData?.simpleBinding?.split(',').includes(option.value),
      )}
    />
  );
}

const controlStylesHasError = (hasError) =>
  hasError ? { borderColor: invalidBorderColor } : {};
