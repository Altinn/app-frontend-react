import React from 'react';

import { CheckboxGroup, CheckboxGroupVariant } from '@altinn/altinn-design-system';
import { makeStyles } from '@material-ui/core/styles';
import cn from 'classnames';

import { useAppSelector, useHasChangedIgnoreUndefined } from 'src/common/hooks';
import { useGetOptions } from 'src/components/hooks';
import { useDelayedSavedState } from 'src/components/hooks/useDelayedSavedState';
import { AltinnSpinner } from 'src/components/shared';
import { shouldUseRowLayout } from 'src/utils/layout';
import { getOptionLookupKey } from 'src/utils/options';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IOption } from 'src/types';

export type ICheckboxContainerProps = PropsFromGenericComponent<'Checkboxes'>;

const useStyles = makeStyles(() => ({
  root: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  legend: {
    color: '#000000',
  },
}));

const defaultOptions: IOption[] = [];
const defaultSelectedOptions: string[] = [];

export const CheckboxContainerComponent = ({
  id,
  options,
  optionsId,
  formData,
  preselectedOptionIndex,
  handleDataChange,
  layout,
  legend,
  readOnly,
  getTextResourceAsString,
  mapping,
  source,
  isValid,
}: ICheckboxContainerProps) => {
  const classes = useStyles();
  const apiOptions: IOption[] | undefined = useGetOptions({ optionsId, mapping, source });
  const calculatedOptions: IOption[] | undefined = apiOptions || options || defaultOptions;
  const hasSelectedInitial = React.useRef(false);
  const optionsHasChanged: boolean = useHasChangedIgnoreUndefined(apiOptions);
  const lookupKey: string | undefined = optionsId && getOptionLookupKey({ id: optionsId, mapping });
  const fetchingOptions = useAppSelector((state) => lookupKey && state.optionState.options[lookupKey]?.loading);

  const { value, setValue, saveValue } = useDelayedSavedState(handleDataChange, formData?.simpleBinding ?? '', 200);

  let selected: string[] = value && value.length > 0 ? value.split(',') : defaultSelectedOptions;

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
    selected = checkedItems;
    setValue(selected.join(','));
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // Only set value instantly if moving focus outside of the checkbox group
    if (!event.currentTarget.contains(event.relatedTarget)) {
      saveValue();
    }
  };

  const isOptionSelected = (option: string) => selected.includes(option);

  const RenderLegend = legend;

  return (
    <>
      <div
        id={`${id}-label`}
        className={cn(classes.legend)}
      >
        <RenderLegend />
      </div>
      {fetchingOptions ? (
        <AltinnSpinner />
      ) : (
        <div
          id={id}
          key={`checkboxes_group_${id}`}
          onBlur={handleBlur}
        >
          <CheckboxGroup
            compact={false}
            disabled={readOnly}
            onChange={handleChange}
            error={!isValid}
            variant={
              shouldUseRowLayout({
                layout,
                optionsCount: calculatedOptions.length,
              })
                ? CheckboxGroupVariant.Horizontal
                : CheckboxGroupVariant.Vertical
            }
            items={calculatedOptions.map((option) => ({
              checked: isOptionSelected(option.value),
              label: getTextResourceAsString(option.label),
              name: option.value,
              checkboxId: `${id}-${option.label}`,
            }))}
          />
        </div>
      )}
    </>
  );
};
