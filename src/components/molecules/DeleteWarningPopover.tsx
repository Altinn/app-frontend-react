import React from 'react';

import { Button, ButtonColor, ButtonVariant, Popover, PopoverVariant } from '@digdir/design-system-react';
import { makeStyles } from '@material-ui/core';

import { useLanguage } from 'src/hooks/useLanguage';

const useStyles = makeStyles({
  popoverButtonContainer: {
    display: 'flex',
    marginTop: '0.625rem',
    gap: '0.625rem',
  },
});

export interface IDeleteWarningPopover {
  trigger: React.ReactNode;
  onPopoverDeleteClick: () => void;
  onCancelClick: () => void;
  deleteButtonText: string;
  messageText: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  placement?: 'bottom' | 'left' | 'right' | 'top';
}

export function DeleteWarningPopover({
  trigger,
  onPopoverDeleteClick,
  onCancelClick,
  deleteButtonText,
  messageText,
  placement = 'bottom',
  open,
  setOpen,
}: IDeleteWarningPopover) {
  const classes = useStyles();
  const { lang } = useLanguage();
  return (
    <Popover
      variant={PopoverVariant.Warning}
      placement={placement}
      trigger={trigger}
      open={open}
      onOpenChange={() => setOpen(!open)}
    >
      <div>{messageText}</div>
      <div className={classes.popoverButtonContainer}>
        <Button
          data-testid='warning-popover-delete-button'
          variant={ButtonVariant.Filled}
          color={ButtonColor.Danger}
          onClick={onPopoverDeleteClick}
        >
          {deleteButtonText}
        </Button>
        <Button
          data-testid='warning-popover-cancel-button'
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Secondary}
          onClick={onCancelClick}
        >
          {lang('general.cancel')}
        </Button>
      </div>
    </Popover>
  );
}
