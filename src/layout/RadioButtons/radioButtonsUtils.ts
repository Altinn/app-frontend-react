import type React from 'react';

import { useGetOptions } from 'src/features/options/useGetOptions';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { IRadioButtonsContainerProps } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';

export const useRadioButtons = ({ node }: IRadioButtonsContainerProps) => {
  const item = useNodeItem(node);
  const {
    options: calculatedOptions,
    isFetching: fetchingOptions,
    setData,
    currentStringy,
  } = useGetOptions({
    ...item,
    node,
    valueType: 'single',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setData(event.target.value);
  };

  const handleChangeRadioGroup = (value: string) => {
    setData(value);
  };

  return {
    handleChange,
    handleChangeRadioGroup,
    fetchingOptions,
    selected: currentStringy,
    calculatedOptions,
  };
};
