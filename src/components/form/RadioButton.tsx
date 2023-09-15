import React, { useRef } from 'react';

import { HelpText, Radio } from '@digdir/design-system-react';
import type { RadioProps } from '@digdir/design-system-react';

import classes from 'src/components/form/RadioButton.module.css';

export interface IRadioButtonProps extends Omit<RadioProps, 'children'> {
  showAsCard?: boolean;
  label?: string;
  helpText?: string;
  hideLabel?: boolean;
}

export const RadioButton = ({ showAsCard = false, label, helpText, hideLabel, ...rest }: IRadioButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const Label = (
    <div className={`${hideLabel ? 'sr-only' : ''} ${classes.radioLabelContainer}`}>
      {label}
      {helpText ? <HelpText title={helpText}>{helpText}</HelpText> : null}
    </div>
  );
  if (showAsCard) {
    return (
      <Radio
        {...rest}
        className={classes.card}
        ref={inputRef}
      >
        {Label}
      </Radio>
    );
  }
  return <Radio {...rest}>{Label}</Radio>;
};
