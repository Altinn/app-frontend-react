import React from 'react';

import { LegacySelect } from '@digdir/design-system-react';

import { FD } from 'src/features/formData/FormDataWrite';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { useFormattedOptions } from 'src/hooks/useFormattedOptions';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export type IMultipleSelectProps = PropsFromGenericComponent<'MultipleSelect'>;
export function MultipleSelectComponent({ node, isValid, overrideDisplay }: IMultipleSelectProps) {
  const item = useNodeItem(node);
  const { id, readOnly, textResourceBindings } = item;
  const debounce = FD.useDebounceImmediately();
  const { langAsString } = useLanguage();

  const { options, currentStringy, setData } = useGetOptions(node, 'multi');
  const formattedOptions = useFormattedOptions(options, true);

  return (
    <LegacySelect
      label={langAsString('general.choose')}
      hideLabel={true}
      options={formattedOptions}
      deleteButtonLabel={langAsString('general.delete')}
      multiple
      inputId={id}
      disabled={readOnly}
      error={!isValid}
      onChange={setData}
      onBlur={debounce}
      value={currentStringy}
      aria-label={overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined}
    />
  );
}
