import React from 'react';

import { Checkbox, HelpText } from '@digdir/design-system-react';
import cn from 'classnames';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { DeleteWarningPopover } from 'src/components/molecules/DeleteWarningPopover';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { useDelayedSavedState } from 'src/hooks/useDelayedSavedState';
import { useLanguage } from 'src/hooks/useLanguage';
import classes from 'src/layout/Checkboxes/CheckboxesContainerComponent.module.css';
import { shouldUseRowLayout } from 'src/utils/layout';
import { getPlainTextFromNode } from 'src/utils/stringHelper';
import type { PropsFromGenericComponent } from 'src/layout';

export type ICheckboxContainerProps = PropsFromGenericComponent<'Checkboxes'>;

const defaultSelectedOptions: string[] = [];

export const CheckboxContainerComponent = ({
  node,
  formData,
  isValid,
  handleDataChange,
  overrideDisplay,
}: ICheckboxContainerProps) => {
  const { id, layout, readOnly, textResourceBindings, required, labelSettings, alertOnChange } = node.item;
  const { lang, langAsString } = useLanguage();
  const {
    value: _value,
    setValue,
    saveValue,
  } = useDelayedSavedState(handleDataChange, formData?.simpleBinding ?? '', 200);

  const value = _value ?? formData?.simpleBinding ?? '';
  const selected = value && value.length > 0 ? value.split(',') : defaultSelectedOptions;
  const { options: calculatedOptions, isFetching } = useGetOptions({
    ...node.item,
    node,
    formData: {
      type: 'multi',
      values: selected,
      setValues: (values) => {
        setValue(values.join(','));
      },
    },
  });
  const [checkedItems, setCheckedItems] = React.useState<string[]>(selected);

  const handleChange = (checkedItems: string[], confirmedChange: boolean = false) => {
    setCheckedItems(checkedItems);
    const isBeingChecked = checkedItems.length > selected.length;
    // if alertOnChange is true, we need to wait for the user to confirm the change
    // checkedItems longer than selected means that the user has checked a new item
    // this logic lets the user check new items without triggering the alert
    if (!alertOnChange || confirmedChange || isBeingChecked) {
      const checkedItemsString = checkedItems.join(',');
      if (checkedItemsString !== value) {
        setValue(checkedItems.join(','));
      }
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
  const ariaLabel = overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined;

  return isFetching ? (
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
          <EnhancedCheckbox
            id={`${id}-${option.label.replace(/\s/g, '-')}`}
            key={option.value}
            description={lang(option.description) as string}
            value={option.value}
            checked={selected.includes(option.value)}
            alertOnChange={alertOnChange}
            renderedInTable={overrideDisplay?.renderedInTable}
            singleCheckbox={calculatedOptions.length === 1}
            label={option.label}
            helpText={option.helpText}
            handleChange={handleChange}
            checkedItems={checkedItems}
          />
        ))}
      </Checkbox.Group>
    </div>
  );
};

interface ICheckboxProps {
  id: string;
  description?: string;
  value: string;
  label: string;
  helpText?: string;
  checked: boolean;
  alertOnChange?: boolean;
  renderedInTable?: boolean;
  singleCheckbox?: boolean;
  handleChange: (checkedItems: string[], confirmedChange: boolean) => void;
  checkedItems: string[];
}

const EnhancedCheckbox = ({
  id,
  description,
  value,
  label,
  helpText,
  checked,
  alertOnChange,
  renderedInTable,
  singleCheckbox,
  handleChange,
  checkedItems,
}: ICheckboxProps) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const { lang, langAsString } = useLanguage();
  const hideLabel = renderedInTable === true && singleCheckbox;

  const handleUncheck = () => {
    setPopoverOpen(false);
    handleChange(checkedItems, true);
  };
  const checkBox = (
    <Checkbox
      id={id}
      name={value}
      description={description}
      value={value}
      checked={checked}
      size='small'
      onChange={alertOnChange && checked ? () => setPopoverOpen(true) : undefined}
    >
      {
        <span className={cn({ 'sr-only': hideLabel }, classes.checkBoxLabelContainer)}>
          {langAsString(label)}
          {helpText && <HelpText title={getPlainTextFromNode(helpText)}>{lang(helpText)}</HelpText>}
        </span>
      }
    </Checkbox>
  );

  if (popoverOpen) {
    return (
      <DeleteWarningPopover
        trigger={checkBox}
        placement='left'
        deleteButtonText={langAsString('group.row_popover_delete_button_confirm')}
        messageText={langAsString('group.row_popover_delete_message')}
        onCancelClick={() => {
          setPopoverOpen(false);
        }}
        onPopoverDeleteClick={handleUncheck}
        open={popoverOpen}
        setOpen={setPopoverOpen}
      />
    );
  }
  return checkBox;
};
