import React from 'react';
import type { ReactNode } from 'react';

import { PencilIcon } from '@navikt/aksel-icons';

import { Button } from 'src/app-components/button/Button';
import classes from 'src/components/EditIconButton.module.css';
export interface IEditIconButtonProps {
  label: ReactNode;
  onClick: () => void;
  id?: string;
}

export function EditIconButton({ id, label, onClick }: IEditIconButtonProps) {
  return (
    <Button
      className={classes.editButton}
      size='sm'
      id={id}
      variant='tertiary'
      onClick={onClick}
      icon={true}
    >
      <PencilIcon
        fontSize={'1rem'}
        aria-hidden
      />
      {label}
    </Button>
  );
}
