import React from 'react';

import { Combobox } from '@digdir/designsystemet-react';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { DeleteWarningPopover } from 'src/components/molecules/DeleteWarningPopover';
import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { useAlertOnChange } from 'src/hooks/useAlertOnChange';
import type { PropsFromGenericComponent } from 'src/layout';

export type IDropdownProps = PropsFromGenericComponent<'Dropdown'>;

export function DropdownComponent({ node, isValid, overrideDisplay }: IDropdownProps) {
  const { id, readOnly, textResourceBindings, alertOnChange } = node.item;
  const { langAsString, lang } = useLanguage();

  const debounce = FD.useDebounceImmediately();

  const { options, isFetching, currentStringy, setData } = useGetOptions({
    ...node.item,
    node,
    removeDuplicates: true,
    valueType: 'single',
  });

  const selectedLabel = options.find((option) => option.value === currentStringy[0])?.label;
  const selectedLabelTranslated = langAsString(selectedLabel);
  const alertText = selectedLabel
    ? lang('form_filler.radiobutton_alert_label', [`<strong>${selectedLabelTranslated}</strong>`])
    : lang('form_filler.radiobutton_alert');

  const { alertOpen, setAlertOpen, handleChange, confirmChange, cancelChange } = useAlertOnChange(
    Boolean(alertOnChange),
    setData,
    (values) => values[0] !== currentStringy[0] && !!currentStringy.length,
  );

  return (
    <ConditionalWrapper
      condition={Boolean(alertOnChange)}
      wrapper={(children) => (
        <DeleteWarningPopover
          onPopoverDeleteClick={confirmChange}
          onCancelClick={cancelChange}
          deleteButtonText={langAsString('form_filler.alert_confirm')}
          messageText={alertText}
          open={alertOpen}
          setOpen={setAlertOpen}
        >
          {children}
        </DeleteWarningPopover>
      )}
    >
      <Combobox
        id={id}
        hideLabel={true}
        value={currentStringy}
        readOnly={readOnly}
        onValueChange={handleChange}
        onBlur={debounce}
        error={!isValid}
        loading={isFetching}
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
            <span style={{ display: 'inline-block', height: '1em' /* Workaround for misaligned checkmark */ }}>
              <Lang
                id={option.label}
                node={node}
              />
            </span>
          </Combobox.Option>
        ))}
      </Combobox>
    </ConditionalWrapper>
  );
}
