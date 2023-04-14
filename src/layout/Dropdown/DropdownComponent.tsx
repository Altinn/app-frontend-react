import React from 'react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { Select } from 'src/components/Select';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useDelayedSavedState } from 'src/hooks/useDelayedSavedState';
import { useGetOptions } from 'src/hooks/useGetOptions';
import { useHasChangedIgnoreUndefined } from 'src/hooks/useHasChangedIgnoreUndefined';
import { getOptionLookupKey } from 'src/utils/options';
import type { PropsFromGenericComponent } from 'src/layout';

export type IDropdownProps = PropsFromGenericComponent<'Dropdown'>;

export function DropdownComponent({
  node,
  formData,
  handleDataChange,
  isValid,
  overrideDisplay,
  getTextResourceAsString,
}: IDropdownProps) {
  const { optionsId, preselectedOptionIndex, id, readOnly, mapping, source, textResourceBindings } = node.item;
  const options = useGetOptions({ optionsId, mapping, source });
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

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(event.target.value);
  };

  return (
    <>
      {fetchingOptions ? (
        <AltinnSpinner />
      ) : (
        <Select
          id={id}
          onChange={handleChange}
          onBlur={saveValue}
          value={value}
          disabled={readOnly}
          error={!isValid}
          options={
            options?.map((option) => ({
              label: getTextResourceAsString(option.label) ?? '',
              value: option.value,
            })) || []
          }
          ariaLabel={
            overrideDisplay?.renderedInTable ? getTextResourceAsString(textResourceBindings?.title) : undefined
          }
        />
      )}
    </>
  );
}
