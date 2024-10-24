import React, { forwardRef, useEffect, useState } from 'react';
import { PatternFormat } from 'react-number-format';
import type { RefObject } from 'react';

import { Button, Textfield } from '@digdir/designsystemet-react';
import { CalendarIcon } from '@navikt/aksel-icons';
import { format, isValid } from 'date-fns';

import { useLanguage } from 'src/features/language/useLanguage';
import styles from 'src/layout/Datepicker/Calendar.module.css';
import { getSaveFormattedDateString, strictParseFormat, strictParseISO } from 'src/utils/dateHelpers';
import { getFormatDisplay, getFormatPattern } from 'src/utils/formatDateLocale';

export interface DatePickerInputProps {
  id: string;
  formatString: string;
  timeStamp: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  onClick?: () => void;
  isDialogOpen?: boolean;
  readOnly?: boolean;
}

export const DatePickerInput = forwardRef(
  (
    { id, value, formatString, timeStamp, onValueChange, isDialogOpen, readOnly, onClick }: DatePickerInputProps,
    ref: RefObject<HTMLButtonElement>,
  ) => {
    const formatDisplay = getFormatDisplay(formatString);
    const formatPattern = getFormatPattern(formatDisplay);
    const dateValue = strictParseISO(value);
    const formattedDateValue = dateValue ? format(dateValue, formatString) : value;
    const [inputValue, setInputValue] = useState(formattedDateValue ?? '');

    useEffect(() => {
      setInputValue(formattedDateValue ?? '');
    }, [formattedDateValue]);

    const saveValue = (e: React.ChangeEvent<HTMLInputElement>) => {
      const stringValue = e.target.value;
      const date = strictParseFormat(stringValue, formatString);
      const valueToSave = getSaveFormattedDateString(date, timeStamp) ?? stringValue;
      onValueChange && onValueChange(valueToSave);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const stringValue = e.target.value;
      setInputValue(stringValue);
      // If the date is valid, save immediately
      if (isValid(strictParseFormat(stringValue, formatString))) {
        saveValue(e);
      }
    };

    const { langAsString } = useLanguage();

    return (
      <div className={styles.calendarInputWrapper}>
        <PatternFormat
          format={formatPattern}
          customInput={Textfield}
          mask='_'
          className={styles.calendarInput}
          type='text'
          id={id}
          value={inputValue}
          placeholder={formatDisplay}
          onChange={handleChange}
          onBlur={saveValue}
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
          size='small'
        >
          <CalendarIcon title={langAsString('date_picker.aria_label_icon')} />
        </Button>
      </div>
    );
  },
);

DatePickerInput.displayName = 'DatePickerInput';
