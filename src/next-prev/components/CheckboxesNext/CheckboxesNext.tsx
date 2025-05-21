import React, { useEffect, useState } from 'react';

import { Checkbox } from '@digdir/designsystemet-react';

import { useResolvedOptions } from 'src/next-prev/components/CheckboxesNext/useResolvedOptions'; // or inline if you prefer
import type { IRawOption } from 'src/layout/common.generated.next';
import type { CompExternal } from 'src/next-prev/stores/layoutStore';
import type { CommonProps } from 'src/next-prev/types/CommonComponentProps';

interface CheckboxesNextType {
  component: CompExternal<'Checkboxes'>;
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

  return (
    <div>
      <Checkbox.Group
        legend=''
        role='radiogroup'
      >
        {fetchedOptions?.map((option, idx) => (
          <Checkbox
            key={idx}
            description={option.description}
            value={`${option.value}`}
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
          >
            {option.label}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );
};
