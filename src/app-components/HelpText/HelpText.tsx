import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { Popover } from '@digdir/designsystemet-react';

import classes from 'src/app-components/HelpText/Helptext.module.css';

export type HelpTextProps = {
  'aria-label': string;
  placement?: 'right' | 'bottom' | 'left' | 'top';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>;

export const HelpText = forwardRef<HTMLButtonElement, HelpTextProps>(function HelpText(
  { placement = 'right', children, ...rest },
  ref,
) {
  return (
    <Popover>
      <Popover.Trigger
        className={classes.helptext}
        ref={ref}
        variant='tertiary'
        data-color='info'
        {...rest}
      />
      <Popover
        placement={placement}
        data-color='info'
      >
        {children}
      </Popover>
    </Popover>
  );
});
