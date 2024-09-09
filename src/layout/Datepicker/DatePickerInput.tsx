import React from 'react';
import type { ChangeEventHandler } from 'react';

import { Button, Textfield } from '@digdir/designsystemet-react';
import { CalendarIcon } from '@navikt/aksel-icons';

import styles from 'src/layout/Datepicker/Calendar.module.css';

export interface DatePickerInputProps {
  id: string;
  value?: string;
  formatString?: string;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  toggleDialog?: () => void;
  isDialogOpen: boolean;
}

export const DatePickerInput = ({
  id,
  value,
  formatString,
  onChange,
  toggleDialog,
  isDialogOpen,
}: DatePickerInputProps) => (
  <div className={styles.calendarInputWrapper}>
    <Textfield
      className={styles.calendarInput}
      type='text'
      id={id}
      value={value}
      placeholder={formatString}
      onChange={onChange}
    />
    <Button
      variant='tertiary'
      icon={true}
      onClick={toggleDialog}
      aria-controls='dialog'
      aria-haspopup='dialog'
      aria-expanded={isDialogOpen}
      aria-label='Open calendar to choose booking date'
    >
      <CalendarIcon />
    </Button>
  </div>
);
