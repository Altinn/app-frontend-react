import React, { useRef, useState } from 'react';

import { HelpText, Radio } from '@digdir/design-system-react';
import type { RadioProps } from '@digdir/design-system-react';

import classes from 'src/components/form/RadioButton.module.css';
import { DeleteWarningPopover } from 'src/components/molecules/DeleteWarningPopover';
import { useLanguage } from 'src/hooks/useLanguage';
import { getPlainTextFromNode } from 'src/utils/stringHelper';

export interface IRadioButtonProps extends Omit<RadioProps, 'children'> {
  showAsCard?: boolean;
  label?: string;
  helpText?: React.ReactNode;
  hideLabel?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  alertOnChange?: boolean;
  selectedLabel?: string;
}

export const RadioButton = ({
  showAsCard = false,
  label,
  helpText,
  hideLabel,
  onChange,
  alertOnChange,
  selectedLabel,
  ...rest
}: IRadioButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const Label = (
    <div className={`${hideLabel ? 'sr-only' : ''} ${classes.radioLabelContainer}`}>
      {label}
      {helpText ? <HelpText title={getPlainTextFromNode(helpText)}>{helpText}</HelpText> : null}
    </div>
  );
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tempEvent, setTempEvent] = useState<React.ChangeEvent<HTMLInputElement>>();
  const { lang } = useLanguage();

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (alertOnChange) {
      event.preventDefault();
      setPopoverOpen(true);
      setTempEvent(event);
    } else {
      onChange(event);
    }
  };
  const confirmChange = () => {
    onChange(tempEvent as React.ChangeEvent<HTMLInputElement>);
    setPopoverOpen(false);
  };

  const radioButton = (
    <Radio
      {...rest}
      onChange={handleRadioChange}
      ref={showAsCard ? inputRef : undefined}
    >
      {Label}
    </Radio>
  );
  const cardElement = (
    /** This element is only clickable for visual
         effects. A screen reader would only want to click
         the inner input element of the DesignSystemRadioButton. **/
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
      {radioButton}
    </div>
  );

  if (popoverOpen) {
    const alertText = selectedLabel
      ? lang('form_filler.radio_button_change_warning_label', [`<strong>${selectedLabel}</strong>`])
      : lang('form_filler.radio_button_change_warning');
    return (
      <DeleteWarningPopover
        trigger={showAsCard ? cardElement : radioButton}
        onPopoverDeleteClick={confirmChange}
        onCancelClick={() => setPopoverOpen(false)}
        deleteButtonText={lang('form_filler.radio_button_change_confirm') as string}
        messageText={alertText as string}
        open={popoverOpen}
        setOpen={setPopoverOpen}
      />
    );
  }

  return showAsCard ? cardElement : radioButton;
};
