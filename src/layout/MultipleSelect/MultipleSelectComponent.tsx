import React, { useCallback } from 'react';

import { EXPERIMENTAL_MultiSuggestion, Field } from '@digdir/designsystemet-react';

import { Label } from 'src/app-components/Label/Label';
import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { getDescriptionId } from 'src/components/label/Label';
import { DeleteWarningPopover } from 'src/features/alertOnChange/DeleteWarningPopover';
import { useAlertOnChange } from 'src/features/alertOnChange/useAlertOnChange';
import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
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
  const { id, readOnly, textResourceBindings, alertOnChange, grid, required, autocomplete } = item;
  const { options, isFetching, selectedValues, setData } = useGetOptions(node, 'multi');
  const debounce = FD.useDebounceImmediately();
  const { langAsString, lang } = useLanguage(node);

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

  const { alertOpen, setAlertOpen, handleChange, confirmChange, cancelChange, alertMessage } = useAlertOnChange(
    Boolean(alertOnChange),
    setData,
    // Only alert when removing values
    (values) => values.length < selectedValues.length,
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
          deleteButtonText={langAsString('form_filler.alert_confirm')}
          messageText={alertMessage}
          onCancelClick={cancelChange}
          onPopoverDeleteClick={confirmChange}
          open={alertOpen}
          setOpen={setAlertOpen}
        >
          {children}
        </DeleteWarningPopover>
      )}
    >
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
            <EXPERIMENTAL_MultiSuggestion
              id={id}
              filter={optionFilter}
              data-size='sm'
              value={selectedValues}
              onValueChange={handleChange}
              onBlur={debounce}
            >
              <EXPERIMENTAL_MultiSuggestion.Chips render={(e) => e.text} />
              <EXPERIMENTAL_MultiSuggestion.Input
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
                autoComplete={autocomplete}
              />
              <EXPERIMENTAL_MultiSuggestion.Clear aria-label={langAsString('form_filler.clear_selection')} />
              <EXPERIMENTAL_MultiSuggestion.List>
                <EXPERIMENTAL_MultiSuggestion.Empty>
                  <Lang id='form_filler.no_options_found' />
                </EXPERIMENTAL_MultiSuggestion.Empty>
                {options.map((option) => (
                  <EXPERIMENTAL_MultiSuggestion.Option
                    key={option.value}
                    value={option.value}
                  >
                    <span>
                      <wbr />
                      <Lang
                        id={option.label}
                        node={node}
                      />
                      {option.description && (
                        <Lang
                          id={option.description}
                          node={node}
                        />
                      )}
                    </span>
                  </EXPERIMENTAL_MultiSuggestion.Option>
                ))}
              </EXPERIMENTAL_MultiSuggestion.List>
            </EXPERIMENTAL_MultiSuggestion>
          </ComponentStructureWrapper>
        </Label>
      </Field>
    </ConditionalWrapper>
  );
}
