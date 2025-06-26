import React, { useCallback } from 'react';

import { EXPERIMENTAL_Suggestion, Field } from '@digdir/designsystemet-react';

import { Label } from 'src/app-components/Label/Label';
import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { getDescriptionId } from 'src/components/label/Label';
import { DeleteWarningPopover } from 'src/features/alertOnChange/DeleteWarningPopover';
import { useAlertOnChange } from 'src/features/alertOnChange/useAlertOnChange';
import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { useSaveValueToGroup } from 'src/features/saveToGroup/useSaveToGroup';
import { useIsValid } from 'src/features/validation/selectors/isValid';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { useLabel } from 'src/utils/layout/useLabel';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { optionFilter } from 'src/utils/options';
import type { PropsFromGenericComponent } from 'src/layout';

export type IMultipleSelectProps = PropsFromGenericComponent<'MultipleSelect'>;
export function MultipleSelectComponent({ node, overrideDisplay }: IMultipleSelectProps) {
  const item = useNodeItem(node);
  const isValid = useIsValid(node);
  const { id, readOnly, textResourceBindings, alertOnChange, grid, required, dataModelBindings } = item;
  const { options, isFetching, selectedValues: selectedFromSimpleBinding, setData } = useGetOptions(node, 'multi');
  const groupBinding = useSaveValueToGroup(dataModelBindings);
  const selectedValues = groupBinding.enabled ? groupBinding.selectedValues : selectedFromSimpleBinding;

  const debounce = FD.useDebounceImmediately();
  const { langAsString, lang } = useLanguage();

  const { labelText, getRequiredComponent, getOptionalComponent, getHelpTextComponent, getDescriptionComponent } =
    useLabel({ node, overrideDisplay });

  const changeMessageGenerator = useCallback(
    (values: string[]) => {
      const labelsToRemove = options
        .filter((o) => selectedValues.includes(o.value) && !values.includes(o.value))
        .map((o) => langAsString(o.label))
        .join(', ');

      return lang('form_filler.multi_select_alert', [labelsToRemove]);
    },
    [lang, langAsString, options, selectedValues],
  );

  const handleOnChange = (values: string[]) => {
    if (groupBinding.enabled) {
      groupBinding.setCheckedValues(values);
    } else {
      setData(values);
    }
  };

  const { alertOpen, setAlertOpen, handleChange, confirmChange, cancelChange, alertMessage } = useAlertOnChange(
    Boolean(alertOnChange),
    handleOnChange,
    // Only alert when removing values
    (values) => values.length < selectedValues.length,
    changeMessageGenerator,
  );

  // return a new array of objects with value and label properties without changing the selectedValues array
  function formatSelectedValues(
    selectedValues: string[],
    options: { value: string; label: string }[],
  ): { value: string; label: string }[] {
    return selectedValues.map((value) => {
      const option = options.find((o) => o.value === value);
      return option ? { value: option.value, label: langAsString(option.label) } : { value, label: value };
    });
  }

  const [componentKey, setComponentKey] = React.useState(0);

  // This is a workaround to force the component to update its internal state, when the user cancels the alert on change
  const onCancelClick = () => {
    cancelChange();
    setComponentKey((prevKey) => prevKey + 1);
  };

  if (isFetching) {
    return <AltinnSpinner />;
  }

  console.log('selectedValues', selectedValues);

  return (
    <Field style={{ width: '100%' }}>
      <Label
        htmlFor={id}
        label={labelText}
        grid={grid?.labelGrid}
        required={required}
        requiredIndicator={getRequiredComponent()}
        optionalIndicator={getOptionalComponent()}
        help={getHelpTextComponent()}
        description={getDescriptionComponent()}
      >
        <ComponentStructureWrapper node={node}>
          {alertOnChange && (
            <DeleteWarningPopover
              deleteButtonText={langAsString('form_filler.alert_confirm')}
              messageText={alertMessage}
              onCancelClick={onCancelClick}
              onPopoverDeleteClick={confirmChange}
              open={alertOpen}
              setOpen={setAlertOpen}
              popoverId='alert-on-change-popover'
            />
          )}
          <EXPERIMENTAL_Suggestion
            key={componentKey}
            id={id}
            data-testid='multiple-select-component'
            multiple
            filter={optionFilter}
            data-size='sm'
            value={formatSelectedValues(selectedValues, options)}
            // value={selectedValues}
            onValueChange={(options) => handleChange(options.map((o) => o.value))}
            onBlur={debounce}
          >
            <EXPERIMENTAL_Suggestion.Chips />
            <EXPERIMENTAL_Suggestion.Input
              aria-invalid={!isValid}
              aria-label={overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined}
              aria-describedby={
                overrideDisplay?.renderedInTable !== true &&
                textResourceBindings?.title &&
                textResourceBindings?.description
                  ? getDescriptionId(id)
                  : undefined
              }
              readOnly={readOnly}
              popovertarget='alert-on-change-popover'
            />
            <EXPERIMENTAL_Suggestion.Clear aria-label={langAsString('form_filler.clear_selection')} />
            <EXPERIMENTAL_Suggestion.List>
              <EXPERIMENTAL_Suggestion.Empty>
                <Lang id='form_filler.no_options_found' />
              </EXPERIMENTAL_Suggestion.Empty>
              {options.map((option) => (
                <EXPERIMENTAL_Suggestion.Option
                  key={option.value}
                  value={option.value}
                  label={langAsString(option.label)}
                >
                  <span>
                    <wbr />
                    <Lang id={option.label} />
                    {option.description && <Lang id={option.description} />}
                  </span>
                </EXPERIMENTAL_Suggestion.Option>
              ))}
            </EXPERIMENTAL_Suggestion.List>
          </EXPERIMENTAL_Suggestion>
        </ComponentStructureWrapper>
      </Label>
    </Field>
  );
}
