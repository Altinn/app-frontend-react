import React from 'react';

import { Checkbox } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { LabelContent } from 'src/components/label/LabelContent';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { useSaveObjectToGroup } from 'src/features/saveToList/useSaveObjectToGroup';
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
  const { options: calculatedOptions, isFetching, setData, selectedValues } = useGetOptions(node, 'multi');
  const group = dataModelBindings?.group;
  const objectToGroupBindings = { ...dataModelBindings };
  delete objectToGroupBindings.label;
  delete objectToGroupBindings.metadata;
  const { toggleRowSelectionInList, isRowChecked } = useSaveObjectToGroup(objectToGroupBindings);

  const isValid = useIsValid(node);
  const horizontal = shouldUseRowLayout({
    layout,
    optionsCount: calculatedOptions.length,
  });

  const hideLabel = overrideDisplay?.renderedInTable === true && calculatedOptions.length === 1 && !showLabelsInTable;
  const ariaLabel = overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined;
  const rowKey = dataModelBindings.simpleBinding.field.split('.').pop();

  const setChecked = (isChecked: boolean, option) => {
    if (group && rowKey) {
      //List { prop1: 'value', prop2: 'value2' ...}
      //Checkboxes {prop1: 'value' }
      toggleRowSelectionInList({ [rowKey]: option.value });
    } else {
      const newData = isChecked ? [...selectedValues, option.value] : selectedValues.filter((o) => o !== option.value);
      setData(newData);
    }
  };

  const isChecked = (rowKey, option) => {
    if (group && rowKey) {
      return isRowChecked({ [rowKey]: option.value });
    } else {
      return selectedValues.includes(option.value);
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
            {calculatedOptions.map((option) => {
              console.log(option, rowKey);
              return (
                <WrappedCheckbox
                  key={option.value}
                  id={id}
                  option={option}
                  hideLabel={hideLabel}
                  alertOnChange={alertOnChange}
                  checked={isChecked(rowKey, option)}
                  setChecked={(isChecked) => setChecked(isChecked, option)}
                />
              );
            })}
          </Checkbox.Group>
        </div>
      )}
    </ComponentStructureWrapper>
  );
};
