import React, { forwardRef, useEffect, useState } from 'react';
import type { FocusEventHandler, RefObject } from 'react';

import { Button, Textfield } from '@digdir/designsystemet-react';
import { CalendarIcon } from '@navikt/aksel-icons';
import { format, isMatch, isValid } from 'date-fns';

import { useLanguage } from 'src/features/language/useLanguage';
import styles from 'src/layout/Datepicker/Calendar.module.css';
import { DatepickerSaveFormatNoTimestamp, DatepickerSaveFormatTimestamp } from 'src/utils/dateHelpers';

export interface DatePickerInputProps {
  id: string;
  value?: string;
  formatString?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onClick?: () => void;
  isDialogOpen?: boolean;
  ariaLabel?: string;
  readOnly?: boolean;
}

const DatePickerInput = forwardRef(
  (
    { id, value, formatString, onBlur, isDialogOpen, ariaLabel, readOnly, onClick }: DatePickerInputProps,
    ref: RefObject<HTMLButtonElement>,
  ) => {
    const [input, setInput] = useState(value ?? '');

    const { langAsString } = useLanguage();

    useEffect(() => {
      if (value && isMatch(value, formatString || DatepickerSaveFormatNoTimestamp || DatepickerSaveFormatTimestamp)) {
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
          readOnly={readOnly}
          aria-readonly={readOnly}
        />
        <Button
          id={`${id}-button`}
          variant='tertiary'
          icon={true}
          aria-controls='dialog'
          aria-haspopup='dialog'
          onClick={onClick}
          aria-expanded={isDialogOpen}
          aria-label={langAsString('date_picker.aria_label_icon')}
          ref={ref}
          disabled={readOnly}
          color='first'
        >
          <CalendarIcon
            style={{ width: '24px', height: '24px' }}
            title={langAsString('date_picker.aria_label_icon')}
          />
        </Button>
      </div>
    );
  },
);

DatePickerInput.displayName = 'DatePickerInput';

export default DatePickerInput;
