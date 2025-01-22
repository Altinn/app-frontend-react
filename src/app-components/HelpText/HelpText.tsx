import React, { forwardRef, useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { Popover } from '@digdir/designsystemet-react';
import cl from 'clsx';
import type { PopoverProps } from '@digdir/designsystemet-react';

import classes from 'src/app-components/HelpText/Helptext.module.css';
import { HelpTextIcon } from 'src/app-components/HelpText/HelpTextIcon';

export type PortalProps = {
  /**
   * Portals the floating element outside of the app root and into the body.
   * @see https://floating-ui.com/docs/floatingportal
   * @default undefined
   */
  portal?: boolean;
};

export type HelpTextProps = {
  title: string;
  size?: PopoverProps['size'];
  placement?: 'right' | 'bottom' | 'left' | 'top';
} & PortalProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>;

export function getSize(size: string) {
  switch (size) {
    case 'xxxsmall':
      return '3xs';
    case 'xxsmall':
      return '2xs';
    case 'xsmall':
      return 'xs';
    case 'small':
      return 'sm';
    case 'medium':
      return 'md';
    case 'large':
      return 'lg';
    case 'xlarge':
      return 'xl';
    case 'xxlarge':
      return '2xl';
    case 'xxxlarge':
      return '3xl';
    case 'xxxxlarge':
      return '4xl';
    default:
      return size;
  }
}

export const HelpText = forwardRef<HTMLButtonElement, HelpTextProps>(function HelpText(
  { title, placement = 'right', portal, className, children, ...rest },
  ref,
) {
  const size = getSize(rest.size || 'md') as PopoverProps['size'];

  const [open, setOpen] = useState(false);

  const helpTextSize = size ? classes[`helpText-${size}`] : '';
  return (
    <Popover
      variant='info'
      placement={placement}
      size={size}
      portal={portal}
      open={open}
      onClose={() => setOpen(false)}
    >
      <Popover.Trigger
        asChild
        variant='tertiary'
        ref={ref}
      />
      <Popover.Trigger
        asChild
        variant='tertiary'
      >
        <button
          className={cl(helpTextSize, classes.helpTextButton, classes.helpTextFocus, className)}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          {...rest}
        >
          <HelpTextIcon
            filled
            className={cl(classes['helpText-icon'], classes['helpText-iconFilled'], className)}
            openState={open}
          />
          <HelpTextIcon
            className={cl(classes['helpText-icon'], className)}
            openState={open}
          />
          <span className='fds-sr-only'>{title}</span>
        </button>
      </Popover.Trigger>
      <Popover.Content className={classes.helpTextContent}>{children}</Popover.Content>
    </Popover>
  );
});
