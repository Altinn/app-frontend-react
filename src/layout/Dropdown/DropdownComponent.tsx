import React from 'react';

import { Select } from '@digdir/design-system-react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useDelayedSavedState } from 'src/hooks/useDelayedSavedState';
import { useFormattedOptions } from 'src/hooks/useFormattedOptions';
import { useGetOptions } from 'src/hooks/useGetOptions';
import { useHasChangedIgnoreUndefined } from 'src/hooks/useHasChangedIgnoreUndefined';
import { useLanguage } from 'src/hooks/useLanguage';
import { duplicateOptionFilter, getOptionLookupKey } from 'src/utils/options';
import type { PropsFromGenericComponent } from 'src/layout';

export type IDropdownProps = PropsFromGenericComponent<'Dropdown'>;

export function DropdownComponent({ node, formData, handleDataChange, isValid, overrideDisplay }: IDropdownProps) {
  const {
    optionsId,
    options: staticOptions,
    preselectedOptionIndex,
    id,
    readOnly,
    mapping,
    queryParameters,
    source,
    textResourceBindings,
    secure,
  } = node.item;
  const { langAsString } = useLanguage();
  const options = (
    useGetOptions({ optionsId, mapping, queryParameters, source, secure, node }) || staticOptions
  )?.filter(duplicateOptionFilter);
  const lookupKey = optionsId && getOptionLookupKey({ id: optionsId, mapping });
  const fetchingOptions = useAppSelector((state) => lookupKey && state.optionState.options[lookupKey]?.loading);
  const hasSelectedInitial = React.useRef(false);
  const optionsHasChanged = useHasChangedIgnoreUndefined(options);

  const { value, setValue, saveValue } = useDelayedSavedState(handleDataChange, formData?.simpleBinding, 200);

  React.useEffect(() => {
    const shouldSelectOptionAutomatically =
      !formData?.simpleBinding &&
      options &&
      typeof preselectedOptionIndex !== 'undefined' &&
      preselectedOptionIndex >= 0 &&
      preselectedOptionIndex < options.length &&
      hasSelectedInitial.current === false;

    if (shouldSelectOptionAutomatically) {
      setValue(options[preselectedOptionIndex].value, true);
      hasSelectedInitial.current = true;
    }
  }, [options, formData, preselectedOptionIndex, setValue]);

  React.useEffect(() => {
    if (optionsHasChanged && formData.simpleBinding) {
      // New options have been loaded, we have to reset form data.
      // We also skip any required validations
      setValue(undefined, true);
    }
  }, [optionsHasChanged, formData, setValue]);

  const formattedOptions = useFormattedOptions(options);

  return (
    <>
      {fetchingOptions ? (
        <AltinnSpinner />
      ) : (
        <Select
          label={langAsString('general.choose')}
          hideLabel={true}
          inputId={id}
          onChange={setValue}
          onBlur={saveValue}
          value={value}
          disabled={readOnly}
          error={!isValid}
          options={formattedOptions}
          aria-label={overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined}
        />
      )}
    </>
  );
}
