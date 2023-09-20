import type React from 'react';

import { useDelayedSavedState } from 'src/hooks/useDelayedSavedState';
import { useGetOptions } from 'src/hooks/useGetOptions';
import type { IRadioButtonsContainerProps } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';

export const useRadioButtons = ({ node, handleDataChange, formData }: IRadioButtonsContainerProps) => {
  const { optionsId, options, preselectedOptionIndex, mapping, queryParameters, secure, source } = node.item;

  const {
    value: selected,
    setValue,
    saveValue,
  } = useDelayedSavedState(handleDataChange, formData?.simpleBinding ?? '', 200);
  const { options: calculatedOptions, isFetching: fetchingOptions } = useGetOptions({
    options,
    optionsId,
    mapping,
    queryParameters,
    secure,
    source,
    node,
    preselectedOptionIndex,
    formData: {
      type: 'single',
      value: selected,
      setValue,
    },
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleChangeRadioGroup = (value: string) => {
    setValue(value);
  };

  const handleBlur: React.FocusEventHandler = (event) => {
    // Only set value instantly if moving focus outside of the radio group
    if (!event.currentTarget.contains(event.relatedTarget)) {
      saveValue();
    }
  };
  return {
    handleChange,
    handleChangeRadioGroup,
    handleBlur,
    fetchingOptions,
    selected,
    calculatedOptions,
  };
};
