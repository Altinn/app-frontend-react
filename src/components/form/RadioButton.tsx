import React, { useRef, useState } from 'react';

import { HelpText, Radio } from '@digdir/design-system-react';
import type { RadioProps } from '@digdir/design-system-react';

import classes from 'src/components/form/RadioButton.module.css';
import { DeleteWarningPopover } from 'src/components/molecules/DeleteWarningPopover';
import { getPlainTextFromNode } from 'src/utils/stringHelper';

export interface IRadioButtonProps extends Omit<RadioProps, 'children'> {
  showAsCard?: boolean;
  label?: string;
  helpText?: React.ReactNode;
  hideLabel?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  relatedComponentsId?: string[];
}

export const RadioButton = ({
  showAsCard = false,
  label,
  helpText,
  hideLabel,
  onChange,
  relatedComponentsId,
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
  const [eventTest, setEventTest] = useState<React.ChangeEvent<HTMLInputElement>>();

  const confirmChange = () => {
    onChange(eventTest as React.ChangeEvent<HTMLInputElement>);
    setPopoverOpen(false);
  };
  console.log(relatedComponentsId);
  const test = true;
  if (showAsCard) {
    return (
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
        <Radio
          {...rest}
          onChange={onChange}
          ref={inputRef}
        >
          {Label}
        </Radio>
      </div>
    );
  }
  const radioButton = (
    <Radio
      onChange={(event) => {
        event.preventDefault();
        if (test) {
          setPopoverOpen(true);
          setEventTest(event);
        } else {
          onChange(event);
        }
      }}
      {...rest}
    >
      {Label}
    </Radio>
  );

  if (popoverOpen) {
    return (
      <DeleteWarningPopover
        trigger={radioButton}
        onPopoverDeleteClick={() => confirmChange()}
        onCancelClick={() => setPopoverOpen(false)}
        deleteButtonText={'Endre'}
        messageText={`Er du sikker på at du vil bytte til denne? Utfylt data i *Forrige label* vil gå tapt`}
        open={popoverOpen}
        setOpen={setPopoverOpen}
      />
    );
  }

  return radioButton;
};
