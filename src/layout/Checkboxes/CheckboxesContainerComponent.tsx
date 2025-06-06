import React from 'react';

import { Checkbox } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { LabelContent } from 'src/components/label/LabelContent';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { useSaveValueToGroup } from 'src/features/saveToGroup/useSaveToGroup';
import { useIsValid } from 'src/features/validation/selectors/isValid';
import classes from 'src/layout/Checkboxes/CheckboxesContainerComponent.module.css';
import { WrappedCheckbox } from 'src/layout/Checkboxes/WrappedCheckbox';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { shouldUseRowLayout } from 'src/utils/layout';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { PropsFromGenericComponent } from 'src/layout';

export type ICheckboxContainerProps = PropsFromGenericComponent<'Checkboxes'>;

export const CheckboxContainerComponent = ({ node, overrideDisplay }: ICheckboxContainerProps) => {
  const item = useNodeItem(node);
  const {
    id,
    layout,
    readOnly,
    textResourceBindings,
    required,
    labelSettings,
    alertOnChange,
    showLabelsInTable,
    dataModelBindings,
  } = item;
  const { langAsString } = useLanguage();
  const {
    options: calculatedOptions,
    isFetching,
    setData,
    selectedValues: selectedFromSimpleBinding,
  } = useGetOptions(node, 'multi');
  const groupBinding = useSaveValueToGroup(dataModelBindings);
  const selectedValues = groupBinding.enabled ? groupBinding.selectedValues : selectedFromSimpleBinding;

  const isValid = useIsValid(node);
  const horizontal = shouldUseRowLayout({
    layout,
    optionsCount: calculatedOptions.length,
  });

  const hideLabel = overrideDisplay?.renderedInTable === true && calculatedOptions.length === 1 && !showLabelsInTable;
  const ariaLabel = overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined;

  const setChecked = (isChecked: boolean, option: IOptionInternal) => {
    if (groupBinding.enabled) {
      groupBinding.toggleValue(option.value);
    } else {
      const newData = isChecked ? [...selectedValues, option.value] : selectedValues.filter((o) => o !== option.value);
      setData(newData);
    }
  };

  const labelTextGroup = (
    <LabelContent
      componentId={id}
      label={textResourceBindings?.title}
      readOnly={readOnly}
      required={required}
      help={textResourceBindings?.help}
      labelSettings={labelSettings}
    />
  );

  return (
    <ComponentStructureWrapper node={node}>
      {isFetching ? (
        <AltinnSpinner />
      ) : (
        <div
          id={id}
          key={`checkboxes_group_${id}`}
        >
          <Checkbox.Group
            className={cn({ [classes.horizontal]: horizontal }, classes.checkboxGroup)}
            legend={labelTextGroup}
            description={textResourceBindings?.description && <Lang id={textResourceBindings?.description} />}
            readOnly={readOnly}
            hideLegend={overrideDisplay?.renderLegend === false}
            error={!isValid}
            aria-label={ariaLabel}
            data-testid='checkboxes-fieldset'
          >
            {calculatedOptions.map((option) => (
              <WrappedCheckbox
                key={option.value}
                id={id}
                option={option}
                hideLabel={hideLabel}
                alertOnChange={alertOnChange}
                checked={selectedValues.includes(option.value)}
                setChecked={(isChecked) => setChecked(isChecked, option)}
              />
            ))}
          </Checkbox.Group>
        </div>
      )}
    </ComponentStructureWrapper>
  );
};
