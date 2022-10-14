import * as React from 'react';

import {
  Button,
  ButtonVariant,
  PanelVariant,
  PopoverPanel,
} from '@altinn/altinn-design-system';
import { makeStyles } from '@material-ui/core';

import { getLanguageFromKey } from 'altinn-shared/utils';
import type { ILanguage } from 'altinn-shared/types';

const useStyles = makeStyles({
  popoverButtonContainer: {
    display: 'flex',
    marginTop: '1rem',
    gap: '1rem',
  },
});

export interface IDeleteWarningPopover {
  open: boolean;
  setPopoverOpen: (open: boolean) => void;
  trigger: React.ReactNode;
  language: ILanguage;
  onPopoverDeleteClick: () => void;
  onCancelClick: () => void;
  deleteButtonText: string;
  messageText: string;
  side?: 'bottom' | 'left' | 'right' | 'top';
}

export function DeleteWarningPopover({
  open,
  setPopoverOpen,
  trigger,
  language,
  onPopoverDeleteClick,
  onCancelClick,
  deleteButtonText,
  messageText,
  side = 'bottom',
}: IDeleteWarningPopover) {
  const classes = useStyles();
  return (
    <PopoverPanel
      variant={PanelVariant.Warning}
      side={side}
      open={open}
      onOpenChange={setPopoverOpen}
      showIcon={false}
      forceMobileLayout={true}
      trigger={trigger}
    >
      <div>{messageText}</div>
      <div className={classes.popoverButtonContainer}>
        <Button
          variant={ButtonVariant.Cancel}
          onClick={onPopoverDeleteClick}
        >
          {deleteButtonText}
        </Button>
        <Button
          variant={ButtonVariant.Secondary}
          onClick={onCancelClick}
        >
          {getLanguageFromKey('general.cancel', language)}
        </Button>
      </div>
    </PopoverPanel>
  );
}
