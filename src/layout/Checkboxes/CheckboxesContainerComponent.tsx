import React from 'react';

import { Fieldset, useCheckboxGroup } from '@digdir/designsystemet-react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { LabelContent } from 'src/components/label/LabelContent';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { useIsValid } from 'src/features/validation/selectors/isValid';
import classes from 'src/layout/Checkboxes/CheckboxesContainerComponent.module.css';
import { WrappedCheckbox } from 'src/layout/Checkboxes/WrappedCheckbox';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { shouldUseRowLayout } from 'src/utils/layout';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export type ICheckboxContainerProps = PropsFromGenericComponent<'Checkboxes'>;

export const CheckboxContainerComponent = ({ node, overrideDisplay }: ICheckboxContainerProps) => {
  const item = useNodeItem(node);
  const { id, layout, readOnly, textResourceBindings, required, labelSettings, alertOnChange, showLabelsInTable } =
    item;
  const { langAsString } = useLanguage();
  const { options: calculatedOptions, isFetching, setData, selectedValues } = useGetOptions(node, 'multi');
  const isValid = useIsValid(node);

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

  const horizontal = shouldUseRowLayout({
    layout,
    optionsCount: calculatedOptions.length,
  });
  const hideLabel = overrideDisplay?.renderedInTable === true && calculatedOptions.length === 1 && !showLabelsInTable;
  const ariaLabel = overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined;

  const { getCheckboxProps } = useCheckboxGroup({
    name: id,
    readOnly,
    value: selectedValues,
    error: !isValid,
  });

  return (
    <ComponentStructureWrapper node={node}>
      {isFetching ? (
        <AltinnSpinner />
      ) : (
        <div
          id={id}
          key={`checkboxes_group_${id}`}
        >
          <Fieldset
            className={classes.checkboxGroup}
            aria-label={ariaLabel}
          >
            {overrideDisplay?.renderLegend !== false && <Fieldset.Legend>{labelTextGroup}</Fieldset.Legend>}
            {textResourceBindings?.description && (
              <Fieldset.Description>
                <Lang id={textResourceBindings?.description} />
              </Fieldset.Description>
            )}
            <ConditionalWrapper
              condition={horizontal}
              wrapper={(children) => (
                <div
                  data-testid='horizontalWrapper'
                  className={classes.horizontal}
                >
                  {children}
                </div>
              )}
            >
              {calculatedOptions.map((option) => (
                <WrappedCheckbox
                  key={option.value}
                  id={id}
                  option={option}
                  hideLabel={hideLabel}
                  alertOnChange={alertOnChange}
                  {...getCheckboxProps(option.value)}
                  checked={selectedValues.includes(option.value)}
                  setChecked={(isChecked) => {
                    const newData = isChecked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((o) => o !== option.value);
                    setData(newData);
                  }}
                />
              ))}
            </ConditionalWrapper>
          </Fieldset>
        </div>
      )}
    </ComponentStructureWrapper>
  );
};
