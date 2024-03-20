import React from 'react';

import { LegacySelect } from '@digdir/design-system-react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { useFormattedOptions } from 'src/hooks/useFormattedOptions';
import type { PropsFromGenericComponent } from 'src/layout';

export type IDropdownProps = PropsFromGenericComponent<'Dropdown'>;

export function DropdownComponent({ node, isValid, overrideDisplay }: IDropdownProps) {
  const { id, readOnly, textResourceBindings } = node.item;
  const { langAsString } = useLanguage();

  const { options, isFetching, currentStringy, setData, debounce } = useGetOptions({
    ...node.item,
    node,
    removeDuplicates: true,
    valueType: 'single',
  });

  const formattedOptions = useFormattedOptions(options);

  if (isFetching) {
    return <AltinnSpinner />;
  }

  return (
    <LegacySelect
      label={langAsString('general.choose')}
      hideLabel={true}
      inputId={id}
      onChange={(newValue) => setData(newValue)}
      onBlur={debounce}
      value={currentStringy}
      disabled={readOnly}
      error={!isValid}
      options={formattedOptions}
      aria-label={overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined}
    />
  );
}
