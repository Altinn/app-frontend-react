import React from 'react';

import { SearchField, TextField } from '@altinn/altinn-design-system';

import { useAppDispatch } from 'src/common/hooks';
import { useDelayedSavedState } from 'src/components/hooks/useDelayedSavedState';
import { DataListsActions } from 'src/shared/resources/dataLists/dataListsSlice';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IInputFormatting } from 'src/layout/layout';

export type IInputProps = PropsFromGenericComponent<'Input'>;

export function InputComponent({
  id,
  readOnly,
  required,
  isValid,
  formData,
  formatting,
  handleDataChange,
  searchField,
  textResourceBindings,
  saveWhileTyping,
}: IInputProps) {
  const { value, setValue, saveValue, onPaste } = useDelayedSavedState(
    handleDataChange,
    formData?.simpleBinding ?? '',
    saveWhileTyping,
  );
  const dispatch = useAppDispatch();
  const handleChange = (e) => setValue(e.target.value);

  const handleChangeSearch = (e) => {
    setValue(e.target.value);
  };

  return (
    <>
      {searchField ? (
        <SearchField
          id={id}
          value={value}
          onChange={handleChangeSearch}
          onBlur={saveValue}
          onPaste={onPaste}
          aria-describedby={textResourceBindings?.description ? `description-${id}` : undefined}
          onKeyUp={(event) => {
            if (event.key === 'Enter') dispatch(DataListsActions.fetch());
          }}
        ></SearchField>
      ) : (
        <TextField
          id={id}
          onBlur={saveValue}
          onChange={handleChange}
          onPaste={onPaste}
          readOnly={readOnly}
          isValid={isValid}
          required={required}
          value={value}
          aria-describedby={textResourceBindings?.description ? `description-${id}` : undefined}
          formatting={formatting as IInputFormatting}
        />
      )}
    </>
  );
}
