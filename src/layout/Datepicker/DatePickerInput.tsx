import React, { forwardRef, useEffect, useState } from 'react';
import type { FocusEventHandler, RefObject } from 'react';

import { Button, Textfield } from '@digdir/designsystemet-react';
import { CalendarIcon } from '@navikt/aksel-icons';
import { format, isValid } from 'date-fns';

import { useLanguage } from 'src/features/language/useLanguage';
import styles from 'src/layout/Datepicker/Calendar.module.css';

export interface DatePickerInputProps {
  id: string;
  value?: string;
  formatString?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onClick?: () => void;
  isDialogOpen: boolean;
  ariaLabel?: string;
  description?: string;
  readOnly?: boolean;
}

const DatePickerInput = forwardRef(
  (
    { id, value, formatString, onBlur, isDialogOpen, ariaLabel, readOnly, onClick, description }: DatePickerInputProps,
    ref: RefObject<HTMLButtonElement>,
  ) => {
    const [input, setInput] = useState(value ?? '');

    const { langAsString } = useLanguage();

    useEffect(() => {
      if (value) {
        setInput(isValid(new Date(value)) ? format(value, formatString ?? 'dd.MM.yyyy') : value);
      }
    }, [value, formatString]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    };

    return (
      <div className={styles.calendarInputWrapper}>
        <Textfield
          className={styles.calendarInput}
          type='text'
          id={id}
          value={input}
          placeholder={formatString}
          onChange={handleInputChange}
          onBlur={onBlur}
          aria-label={ariaLabel}
          aria-describedby={description ? `${description}-${id}` : undefined}
          readOnly={readOnly}
          aria-readonly={readOnly}
        />
        <Button
          variant='tertiary'
          icon={true}
          aria-controls='dialog'
          aria-haspopup='dialog'
          onClick={onClick}
          aria-expanded={isDialogOpen}
          aria-label={langAsString('date_picker.aria_label_icon')}
          ref={ref}
          aria-readonly={readOnly}
          disabled={readOnly}
        >
          <CalendarIcon />
        </Button>
      </div>
    );
  },
);

DatePickerInput.displayName = 'DatePickerInput';

export default DatePickerInput;
