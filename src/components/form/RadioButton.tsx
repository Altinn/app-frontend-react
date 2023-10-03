import React, { useEffect, useRef } from 'react';

import { HelpText, Radio } from '@digdir/design-system-react';
import type { RadioProps } from '@digdir/design-system-react';

import classes from 'src/components/form/RadioButton.module.css';
import { getPlainTextFromNode } from 'src/utils/stringHelper';

export interface IRadioButtonProps extends Omit<RadioProps, 'children'> {
  showAsCard?: boolean;
  label?: string;
  helpText?: React.ReactNode;
  hideLabel?: boolean;
}

export const RadioButton = ({ showAsCard = false, label, helpText, hideLabel, ...rest }: IRadioButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const Label = (
    <div className={`${hideLabel ? 'sr-only' : ''} ${classes.radioLabelContainer}`}>
      {label}
      {helpText ? <HelpText title={getPlainTextFromNode(helpText)}>{helpText}</HelpText> : null}
    </div>
  );

  useEffect(() => {
    // Name attribute is not added by digdir design system
    if (inputRef.current && rest.name) {
      inputRef.current.name = rest.name;
    }
  }, [rest.name]);

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
          ref={inputRef}
        >
          {Label}
        </Radio>
      </div>
    );
  }
  return (
    <Radio
      {...rest}
      ref={inputRef}
    >
      {Label}
    </Radio>
  );
};
