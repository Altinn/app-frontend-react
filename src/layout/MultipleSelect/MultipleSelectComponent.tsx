import React from 'react';

import { Combobox } from '@digdir/designsystemet-react';

import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import type { PropsFromGenericComponent } from 'src/layout';

export type IMultipleSelectProps = PropsFromGenericComponent<'MultipleSelect'>;
export function MultipleSelectComponent({ node, isValid, overrideDisplay }: IMultipleSelectProps) {
  const { id, readOnly, textResourceBindings } = node.item;
  const debounce = FD.useDebounceImmediately();
  const { options, isFetching, selectedValues, setData } = useGetOptions({
    ...node.item,
    node,
    removeDuplicates: true,
  });
  const { langAsString } = useLanguage();

  return (
    <Combobox
      multiple
      hideLabel
      id={id}
      value={selectedValues}
      readOnly={readOnly}
      onValueChange={setData}
      onBlur={debounce}
      error={!isValid}
      loading={isFetching}
      clearButtonLabel={langAsString('form_filler.clear_selection')}
      aria-label={overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined}
    >
      <Combobox.Empty>
        <Lang id={'form_filler.no_options_found'} />
      </Combobox.Empty>
      {options.map((option) => (
        <Combobox.Option
          key={option.value}
          value={option.value}
          description={langAsString(option.description)}
          displayValue={langAsString(option.label)}
        >
          <Lang
            id={option.label}
            node={node}
          />
        </Combobox.Option>
      ))}
    </Combobox>
  );
}
