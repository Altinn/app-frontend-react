import React from 'react';

import { Button, Popover } from '@digdir/designsystemet-react';

import classes from 'src/features/alertOnChange/DeleteWarningPopover.module.css';
import { Lang } from 'src/features/language/Lang';

export interface IDeleteWarningPopover {
  children: React.ReactNode;
  onPopoverDeleteClick: () => void;
  onCancelClick: () => void;
  deleteButtonText: string;
  messageText: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  placement?: 'bottom' | 'left' | 'right' | 'top';
}

export function DeleteWarningPopover({
  children,
  onPopoverDeleteClick,
  onCancelClick,
  deleteButtonText,
  messageText,
  placement = 'bottom',
  open,
  setOpen,
}: IDeleteWarningPopover) {
  return (
    <Popover.Context>
      <Popover.Trigger
        asChild
        onClick={() => setOpen(!open)}
      >
        {children}
      </Popover.Trigger>
      <Popover
        className={classes.popover}
        variant='warning'
        placement={placement}
        open={open}
        onClose={() => setOpen(false)}
      >
        <div>{messageText}</div>
        <div className={classes.popoverButtonContainer}>
          <Button
            data-testid='warning-popover-delete-button'
            variant='primary'
            size='sm'
            color='danger'
            onClick={onPopoverDeleteClick}
          >
            {deleteButtonText}
          </Button>
          <Button
            data-testid='warning-popover-cancel-button'
            variant='tertiary'
            size='sm'
            color='neutral'
            onClick={onCancelClick}
          >
            <Lang id={'general.cancel'} />
          </Button>
        </div>
      </Popover>
    </Popover.Context>
  );
}
