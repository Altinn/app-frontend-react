import React, { useId } from 'react';

import { RadioButton as DesignSystemRadioButton } from '@digdir/design-system-react';
import type { RadioButtonProps } from '@digdir/design-system-react';

import classes from 'src/components/form/RadioButton.module.css';
import { getPlainTextFromNode } from 'src/utils/stringHelper';

const Card = ({ children }: { children: React.ReactNode }) => <div className={classes.card}>{children}</div>;

export interface IAppRadioButtonProps extends RadioButtonProps {
  showAsCard?: boolean;
}

export const RadioButton = ({ showAsCard = false, ...rest }: IAppRadioButtonProps) => {
  const randomId = useId();
  if (showAsCard) {
    const id = `input-${randomId}`;
    return (
      <Card>
        <label
          className={classes.cardLabel}
          htmlFor={id}
          aria-hidden='true'
          aria-label={getPlainTextFromNode(rest.label)}
        />
        <DesignSystemRadioButton
          {...rest}
          radioId={id}
        />
      </Card>
    );
  }
  return <DesignSystemRadioButton {...rest} />;
};
