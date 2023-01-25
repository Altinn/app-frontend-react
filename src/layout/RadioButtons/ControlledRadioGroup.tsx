import React from 'react';
import type { ChangeEventHandler, FocusEventHandler } from 'react';

import { RadioGroup, RadioGroupVariant } from '@altinn/altinn-design-system';

import { AltinnSpinner } from 'src/components/shared';
import { shouldUseRowLayout } from 'src/utils/layout';
import type { IRadioButtonsContainerProps } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';
import type { IOption } from 'src/types';

export interface IControlledRadioGroupProps extends IRadioButtonsContainerProps {
  fetchingOptions: boolean | undefined;
  selected: string | undefined;
  handleBlur: FocusEventHandler<HTMLInputElement | HTMLButtonElement | HTMLDivElement>;
  handleChange: ChangeEventHandler<HTMLInputElement | HTMLButtonElement>;
  handleChangeRadioGroup: (value: string) => void;
  calculatedOptions: IOption[];
}

export const ControlledRadioGroup = ({
  id,
  layout,
  textResourceBindings,
  getTextResourceAsString,
  fetchingOptions,
  selected,
  readOnly,
  handleBlur,
  handleChangeRadioGroup,
  calculatedOptions,
  isValid,
}: IControlledRadioGroupProps) => {
  return (
    <div>
      {fetchingOptions ? (
        <AltinnSpinner />
      ) : (
        <div
          id={id}
          onBlur={handleBlur}
        >
          <RadioGroup
            name={id}
            aria-labelledby={`${id}-label`}
            items={calculatedOptions.map((option) => ({
              label: getTextResourceAsString(option.label),
              value: option.value,
              checkboxId: `${id}-${option.label}`,
            }))}
            legend={getTextResourceAsString(textResourceBindings?.title ? textResourceBindings.title : '')}
            value={selected}
            error={!isValid}
            disabled={readOnly}
            variant={
              shouldUseRowLayout({
                layout,
                optionsCount: calculatedOptions.length,
              })
                ? RadioGroupVariant.Horizontal
                : RadioGroupVariant.Vertical
            }
            onChange={handleChangeRadioGroup}
          />
        </div>
      )}
    </div>
  );
};
