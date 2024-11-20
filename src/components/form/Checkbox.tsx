import React, { useRef } from 'react';

import { Checkbox, HelpText } from '@digdir/designsystemet-react';
import cn from 'classnames';
import type { CheckboxProps } from '@digdir/designsystemet-react';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import classes from 'src/components/form/Checkbox.module.css';
import { DeleteWarningPopover } from 'src/features/alertOnChange/DeleteWarningPopover';
import { useAlertOnChange } from 'src/features/alertOnChange/useAlertOnChange';
import { useLanguage } from 'src/features/language/useLanguage';

export interface ICheckboxProps extends Omit<CheckboxProps, 'children'> {
  showAsCard?: boolean;
  label?: string;
  helpText?: React.ReactNode;
  hideLabel?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  alertOnChange?: boolean;
  alertText?: React.ReactNode;
  confirmChangeText?: string;
}

export const CustomCheckbox = ({
  showAsCard = false,
  label,
  helpText,
  hideLabel,
  onChange,
  alertOnChange,
  alertText,
  confirmChangeText,
  className,
  ...rest
}: ICheckboxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { elementAsString } = useLanguage();

  const { alertOpen, setAlertOpen, handleChange, confirmChange, cancelChange } = useAlertOnChange(
    Boolean(alertOnChange),
    onChange,
  );

  const customCheckbox = (
    <Checkbox
      {...rest}
      className={cn(classes.customCheckbox, className)}
      onChange={handleChange}
      ref={showAsCard ? inputRef : undefined}
    >
      {label && (
        <div className={`${hideLabel ? 'sr-only' : ''} ${classes.checkboxLabelContainer}`}>
          {label}
          {helpText ? <HelpText title={elementAsString(helpText)}>{helpText}</HelpText> : null}
        </div>
      )}
    </Checkbox>
  );
  const cardElement = (
    /** This element is only clickable for visual
         effects. A screen reader would only want to click
         the inner input element of the DesignSystemCheckboxButton. **/
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div
      className={classes.card}
      data-testid={`test-id-${label}`}
      onClick={() => {
        if (inputRef.current) {
          inputRef.current.click();
        }
      }}
    >
      {customCheckbox}
    </div>
  );

  return (
    <ConditionalWrapper
      condition={Boolean(alertOnChange)}
      wrapper={(children) => (
        <DeleteWarningPopover
          onPopoverDeleteClick={confirmChange}
          onCancelClick={cancelChange}
          deleteButtonText={confirmChangeText as string}
          messageText={alertText}
          open={alertOpen}
          setOpen={setAlertOpen}
        >
          {children}
        </DeleteWarningPopover>
      )}
    >
      {showAsCard ? cardElement : customCheckbox}
    </ConditionalWrapper>
  );
};
