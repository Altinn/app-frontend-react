import React, { useEffect, useState } from 'react';

import { Checkbox, Fieldset, useCheckboxGroup } from '@digdir/designsystemet-react';

import { useResolvedOptions } from 'src/next/components/CheckboxesNext/useResolvedOptions';
import type { IRawOption } from 'src/layout/common.generated';
import type { CompIntermediateExact } from 'src/layout/layout';
import type { CommonProps } from 'src/next/types/CommonComponentProps';

interface CheckboxesNextType {
  component: CompIntermediateExact<'Checkboxes'>;
  commonProps: CommonProps;
}

export const CheckboxesNext: React.FC<CheckboxesNextType> = ({ component, commonProps }) => {
  const fetchedOptions: IRawOption[] | undefined = useResolvedOptions(component, commonProps);

  const [localOptions, setLocalOptions] = useState<string[]>([]);

  useEffect(() => {
    if (commonProps.currentValue) {
      setLocalOptions(commonProps.currentValue.split(','));
    }
  }, [commonProps.currentValue]);

  const { getCheckboxProps, validationMessageProps } = useCheckboxGroup({
    name: 'my-checkbox-group',
    value: localOptions,
    error: 'Du må velge minst ett alternativ',
  });

  return (
    <Fieldset>
      {fetchedOptions?.map((option, idx) => (
        <Checkbox
          key={idx}
          {...getCheckboxProps(`${option.value}`)}
          label={option.label}
          value={`${option.value}`}
          description={option.description}
          checked={option.value ? localOptions.includes(`${option.value}`) : false}
          onChange={(e) => {
            let nextOptions: string[] = [];
            if (localOptions.includes(e.target.value)) {
              nextOptions = localOptions.filter((val) => val !== e.target.value);
            } else {
              nextOptions = [...localOptions, e.target.value];
            }
            commonProps.onChange(nextOptions.join(','));
          }}
        />
      ))}
    </Fieldset>
  );
};
