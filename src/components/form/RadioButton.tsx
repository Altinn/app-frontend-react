import React, { useRef } from 'react';

import { RadioButton as DesignSystemRadioButton } from '@digdir/design-system-react';
import type { RadioButtonProps } from '@digdir/design-system-react';

import classes from 'src/components/form/RadioButton.module.css';

const Card = ({ children }: { children: React.ReactNode }) => <div className={classes.card}>{children}</div>;

export interface IAppRadioButtonProps extends RadioButtonProps {
  showAsCard?: boolean;
}

export const RadioButton = ({ showAsCard = false, ...rest }: IAppRadioButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  if (showAsCard) {
    return (
      <Card>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <div
          className={classes.cardLabel}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.click();
              inputRef.current.focus();
            }
          }}
        />
        <DesignSystemRadioButton
          {...rest}
          ref={inputRef}
        />
      </Card>
    );
  }
  return <DesignSystemRadioButton {...rest} />;
};
