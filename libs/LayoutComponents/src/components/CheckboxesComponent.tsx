import React, { useEffect, useState } from 'react';

import { Checkbox, Fieldset, useCheckboxGroup } from '@digdir/designsystemet-react';

import { withFormEngine } from 'libs/FormEngineReact/components/FormEngineComponent';
import type { FormEngineComponentContext } from 'libs/FormEngineReact/components/FormEngineComponent';

interface CheckboxesComponentProps {
  formEngine: FormEngineComponentContext;
  className?: string;
}

function CheckboxesComponentBase({ formEngine, className = '' }: CheckboxesComponentProps) {
  const { value, updateValue, errors, config } = formEngine;
  
  // TODO: Get options from FormEngine options service or component config
  const options = config.options || [];
  
  const [localOptions, setLocalOptions] = useState<string[]>([]);

  useEffect(() => {
    if (value) {
      setLocalOptions(typeof value === 'string' ? value.split(',') : []);
    }
  }, [value]);

  const { getCheckboxProps } = useCheckboxGroup({
    name: `checkboxes-${config.id}`,
    value: localOptions,
    error: errors.length > 0 ? errors[0] : undefined,
  });

  return (
    <Fieldset className={className}>
      {options.map((option, idx) => (
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
            updateValue(nextOptions.join(','));
          }}
        />
      ))}
    </Fieldset>
  );
}

export const CheckboxesComponent = withFormEngine(CheckboxesComponentBase);