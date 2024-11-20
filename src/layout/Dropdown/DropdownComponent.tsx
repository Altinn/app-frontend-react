import React, { useCallback } from 'react';

import { Combobox, HelpText } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';

import { Label } from 'src/app-components/Label/Label';
import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { Description } from 'src/components/form/Description';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { DeleteWarningPopover } from 'src/features/alertOnChange/DeleteWarningPopover';
import { useAlertOnChange } from 'src/features/alertOnChange/useAlertOnChange';
import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { useIsValid } from 'src/features/validation/selectors/isValid';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import comboboxClasses from 'src/styles/combobox.module.css';
import { gridBreakpoints } from 'src/utils/formComponentUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export type IDropdownProps = PropsFromGenericComponent<'Dropdown'>;

export function DropdownComponent({ node, overrideDisplay }: IDropdownProps) {
  const item = useNodeItem(node);
  const isValid = useIsValid(node);
  const { id, readOnly, textResourceBindings, alertOnChange, grid, required, labelSettings } = item;
  const { langAsString, lang } = useLanguage(node);

  const { options, isFetching, selectedValues, setData } = useGetOptions(node, 'single');
  const debounce = FD.useDebounceImmediately();

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
      <>
        {overrideDisplay?.renderedInTable !== true && (
          <Grid
            item
            {...gridBreakpoints(grid?.labelGrid)}
          >
            <Label
              htmlFor={id}
              label={langAsString(textResourceBindings?.title)}
              required={required}
              requiredIndicator={<RequiredIndicator required={required} />}
              optionalIndicator={
                <OptionalIndicator
                  readOnly={readOnly}
                  required={required}
                  showOptionalMarking={!!labelSettings?.optionalIndicator}
                />
              }
              help={
                textResourceBindings?.help ? (
                  <HelpText
                    id={`${id}-helptext`}
                    title={`${langAsString('helptext.button_title_prefix')} ${langAsString(textResourceBindings?.title)}`}
                  >
                    <Lang id={textResourceBindings?.help} />
                  </HelpText>
                ) : undefined
              }
            />
            {textResourceBindings?.description && (
              <Description description={<Lang id={textResourceBindings?.description} />} />
            )}
          </Grid>
        )}
        <ComponentStructureWrapper node={node}>
          <Combobox
            id={id}
            size='sm'
            hideLabel={true}
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
      </>
    </ConditionalWrapper>
  );
}
