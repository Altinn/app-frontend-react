import React, { useState } from 'react';

import { Fieldset, Radio, useRadioGroup } from '@digdir/designsystemet-react';

import { useResolvedOptions } from 'src/next/components/CheckboxesNext/useResolvedOptions';
import type { IRawOption } from 'src/layout/common.generated';
import type { CompIntermediateExact } from 'src/layout/layout';
import type { CommonProps } from 'src/next/types/CommonComponentProps';

interface RadioButtonsNextType {
  component: CompIntermediateExact<'RadioButtons'>;
  commonProps: CommonProps;
}

export const RadioButtonsNext: React.FC<RadioButtonsNextType> = ({ component, commonProps }) => {
  // 1. Resolve the final options the same way
  const fetchedOptions: IRawOption[] | undefined = useResolvedOptions(component, commonProps);

  // 2. Manage a single, selected value
  const [selected, setSelected] = useState<string>(commonProps.currentValue || '');

  const { getRadioProps, validationMessageProps } = useRadioGroup({
    name: 'my-radio-group',
    value: 'sjokolade',
    error: 'Du må velge et alternativ',
  });

  return (
    <Fieldset>
      {fetchedOptions?.map((option, idx) => (
        <Radio
          key={idx}
          {...getRadioProps(`${option.value}`)}
          label={option.label}
          value={`${option.value}`}
          description={option.description}
          checked={selected === option.value}
          onChange={(e) => {
            setSelected(e.target.value);
            commonProps.onChange(e.target.value);
          }}
        />
      ))}
    </Fieldset>
  );
};
