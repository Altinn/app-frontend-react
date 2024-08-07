import React, { useCallback } from 'react';

import { Combobox } from '@digdir/designsystemet-react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { DeleteWarningPopover } from 'src/components/molecules/DeleteWarningPopover';
import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { useAlertOnChange } from 'src/hooks/useAlertOnChange';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import comboboxClasses from 'src/styles/combobox.module.css';
import type { PropsFromGenericComponent } from 'src/layout';

export type IDropdownProps = PropsFromGenericComponent<'Dropdown'>;

export function DropdownComponent({ node, isValid, overrideDisplay }: IDropdownProps) {
  const { id, readOnly, textResourceBindings, alertOnChange } = node.item;
  const { langAsString, lang } = useLanguage(node);

  const debounce = FD.useDebounceImmediately();

  const { options, isFetching, selectedValues, setData, key } = useGetOptions({
    ...node.item,
    valueType: 'single',
    node,
    removeDuplicates: true,
  });

  const changeMessageGenerator = useCallback(
    (values: string[]) => {
      const label = options
        .filter((o) => values.includes(o.value))
        .map((o) => langAsString(o.label))
        .join(', ');

      return lang('form_filler.dropdown_alert', [label]);
    },
    [lang, langAsString, options],
  );

  const { alertOpen, setAlertOpen, handleChange, confirmChange, cancelChange, alertMessage } = useAlertOnChange(
    Boolean(alertOnChange),
    setData,
    (values) => values[0] !== selectedValues[0] && !!selectedValues.length,
    changeMessageGenerator,
  );

  if (isFetching) {
    return <AltinnSpinner />;
  }

  return (
    <ConditionalWrapper
      condition={Boolean(alertOnChange)}
      wrapper={(children) => (
        <DeleteWarningPopover
          onPopoverDeleteClick={confirmChange}
          onCancelClick={cancelChange}
          deleteButtonText={langAsString('form_filler.alert_confirm')}
          messageText={alertMessage}
          open={alertOpen}
          setOpen={setAlertOpen}
        >
          {children}
        </DeleteWarningPopover>
      )}
    >
      <ComponentStructureWrapper
        node={node}
        label={overrideDisplay?.renderedInTable !== true ? { ...node.item, renderLabelAs: 'label' } : undefined}
      >
        <Combobox
          id={id}
          size='sm'
          hideLabel={true}
          key={key} // Workaround for clearing text input
          value={selectedValues}
          readOnly={readOnly}
          onValueChange={handleChange}
          onBlur={debounce}
          error={!isValid}
          label={overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined}
          aria-label={overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined}
          className={comboboxClasses.container}
        >
          <Combobox.Empty>
            <Lang id={'form_filler.no_options_found'} />
          </Combobox.Empty>
          {options.map((option) => (
            <Combobox.Option
              key={option.value}
              value={option.value}
              description={option.description ? langAsString(option.description) : undefined}
              displayValue={langAsString(option.label) || '\u200b'} // Workaround to prevent component from crashing due to empty string
            >
              <span>
                <wbr />
                <Lang
                  id={option.label}
                  node={node}
                />
              </span>
            </Combobox.Option>
          ))}
        </Combobox>
      </ComponentStructureWrapper>
    </ConditionalWrapper>
  );
}
