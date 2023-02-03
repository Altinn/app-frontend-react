import React from 'react';
import type { ChangeEventHandler, FocusEventHandler } from 'react';

import { RadioGroup, RadioGroupVariant } from '@digdir/design-system-react';

import { AltinnSpinner } from 'src/components/shared';
import { OptionalIndicator } from 'src/features/form/components/OptionalIndicator';
import { RequiredIndicator } from 'src/features/form/components/RequiredIndicator';
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
  getTextResourceAsString,
  fetchingOptions,
  selected,
  readOnly,
  texts,
  required,
  labelSettings,
  language,
  handleBlur,
  handleChangeRadioGroup,
  calculatedOptions,
  isValid,
}: IControlledRadioGroupProps) => {
  const labelText = (
    <span className='a-form-label title-label'>
      {texts.title}
      <RequiredIndicator
        required={required}
        language={language}
      />
      <OptionalIndicator
        labelSettings={labelSettings}
        language={language}
        required={required}
      />
    </span>
  );

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
            legend={labelText}
            description={texts.description}
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
