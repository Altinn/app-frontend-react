import React from 'react';

import { Checkbox, HelpText } from '@digdir/design-system-react';
import cn from 'classnames';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useDelayedSavedState } from 'src/hooks/useDelayedSavedState';
import { useGetOptions } from 'src/hooks/useGetOptions';
import { useHasChangedIgnoreUndefined } from 'src/hooks/useHasChangedIgnoreUndefined';
import { useLanguage } from 'src/hooks/useLanguage';
import classes from 'src/layout/Checkboxes/CheckboxesContainerComponent.module.css';
import { shouldUseRowLayout } from 'src/utils/layout';
import { getOptionLookupKey } from 'src/utils/options';
import { getPlainTextFromNode } from 'src/utils/stringHelper';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IOption } from 'src/layout/common.generated';

export type ICheckboxContainerProps = PropsFromGenericComponent<'Checkboxes'>;

const defaultOptions: IOption[] = [];
const defaultSelectedOptions: string[] = [];

export const CheckboxContainerComponent = ({
  node,
  formData,
  isValid,
  handleDataChange,
  overrideDisplay,
}: ICheckboxContainerProps) => {
  const {
    id,
    options,
    optionsId,
    preselectedOptionIndex,
    layout,
    readOnly,
    mapping,
    queryParameters,
    source,
    textResourceBindings,
    required,
    labelSettings,
  } = node.item;
  const apiOptions = useGetOptions({ optionsId, mapping, queryParameters, source });
  const calculatedOptions = apiOptions || options || defaultOptions;
  const hasSelectedInitial = React.useRef(false);
  const optionsHasChanged = useHasChangedIgnoreUndefined(apiOptions);
  const lookupKey = optionsId && getOptionLookupKey({ id: optionsId, mapping });
  const fetchingOptions = useAppSelector((state) => lookupKey && state.optionState.options[lookupKey]?.loading);
  const { lang, langAsString } = useLanguage();

  const { value, setValue, saveValue } = useDelayedSavedState(handleDataChange, formData?.simpleBinding ?? '', 200);

  const selected = value && value.length > 0 ? value.split(',') : defaultSelectedOptions;

  React.useEffect(() => {
    const shouldSelectOptionAutomatically =
      !formData?.simpleBinding &&
      typeof preselectedOptionIndex !== 'undefined' &&
      preselectedOptionIndex >= 0 &&
      calculatedOptions &&
      preselectedOptionIndex < calculatedOptions.length &&
      hasSelectedInitial.current === false;

    if (shouldSelectOptionAutomatically) {
      setValue(calculatedOptions[preselectedOptionIndex].value, true);
      hasSelectedInitial.current = true;
    }
  }, [formData?.simpleBinding, calculatedOptions, setValue, preselectedOptionIndex]);

  React.useEffect(() => {
    if (optionsHasChanged && formData.simpleBinding) {
      // New options have been loaded, we have to reset form data.
      setValue(undefined, true);
    }
  }, [setValue, optionsHasChanged, formData]);

  const handleChange = (checkedItems: string[]) => {
    const checkedItemsString = checkedItems.join(',');
    if (checkedItemsString !== value) {
      setValue(checkedItems.join(','));
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // Only set value instantly if moving focus outside of the checkbox group
    if (!event.currentTarget.contains(event.relatedTarget)) {
      saveValue();
    }
  };

  const labelTextGroup = (
    <span className={classes.checkBoxLabelContainer}>
      {lang(node.item.textResourceBindings?.title)}
      <RequiredIndicator required={required} />
      <OptionalIndicator
        labelSettings={labelSettings}
        required={required}
      />
      {textResourceBindings?.help && (
        <HelpText title={langAsString(textResourceBindings?.help)}>{lang(textResourceBindings?.help)}</HelpText>
      )}
    </span>
  );
  const horizontal = shouldUseRowLayout({
    layout,
    optionsCount: calculatedOptions.length,
  });
  const hideLabel = overrideDisplay?.renderedInTable === true && calculatedOptions.length === 1;
  const ariaLabel = overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined;

  return fetchingOptions ? (
    <AltinnSpinner />
  ) : (
    <div
      id={id}
      key={`checkboxes_group_${id}`}
      onBlur={handleBlur}
    >
      <Checkbox.Group
        className={cn({ [classes.horizontal]: horizontal })}
        legend={labelTextGroup}
        description={lang(textResourceBindings?.description)}
        disabled={readOnly}
        onChange={(values) => handleChange(values)}
        hideLegend={overrideDisplay?.renderLegend === false}
        error={!isValid}
        aria-label={ariaLabel}
        value={selected}
      >
        {calculatedOptions.map((option) => (
          <Checkbox
            id={`${id}-${option.label.replace(/\s/g, '-')}`}
            name={option.value}
            key={option.value}
            description={lang(option.description)}
            value={option.value}
            checked={selected.includes(option.value)}
            size='small'
          >
            {
              <span className={cn({ 'sr-only': hideLabel }, classes.checkBoxLabelContainer)}>
                {langAsString(option.label)}
                {option.helpText && (
                  <HelpText title={getPlainTextFromNode(option.helpText)}>{lang(option.helpText)}</HelpText>
                )}
              </span>
            }
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );
};
