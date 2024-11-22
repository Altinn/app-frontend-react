import React, { useState } from 'react';

import { Grid } from '@material-ui/core';
import { CalendarIcon } from '@navikt/aksel-icons';
import { isValid as isValidDate } from 'date-fns';

import { Button } from 'src/app-components/button/Button';
import styles from 'src/layout/Datepicker/Calendar.module.css';
import { DatePickerCalendar } from 'src/layout/Datepicker/DatePickerCalendar';
import { DatePickerDialog } from 'src/layout/Datepicker/DatepickerDialog';
import { DatePickerInput } from 'src/layout/Datepicker/DatePickerInput';
import { getSaveFormattedDateString } from 'src/utils/dateHelpers';

export type DatePickerControlProps = {
  id: string;
  value: string;
  dateFormat: string;
  timeStamp?: boolean;
  onValueChange: (isoDateString: string) => void;
  onSelectDate?: (date: Date) => void;
  readOnly?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  locale: string;
  isMobile?: boolean;
};

export const DatePickerControl: React.FC<DatePickerControlProps> = ({
  id,
  value,
  dateFormat,
  timeStamp = true,
  onValueChange,
  onSelectDate,
  readOnly = false,
  required = false,
  minDate,
  maxDate,
  locale,
  isMobile = false,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dateValue = new Date(value);
  const dayPickerDate = isValidDate(dateValue) ? dateValue : new Date();

  const handleDayPickerSelect = (date: Date) => {
    if (date && isValidDate(date)) {
      const nextValue = getSaveFormattedDateString(date, timeStamp);
      if (nextValue) {
        onValueChange(nextValue);
      }
    }
    setIsDialogOpen(false);
  };

  return (
    <Grid
      container
      item
      xs={12}
    >
      <div className={styles.calendarInputWrapper}>
        <DatePickerInput
          id={id}
          value={value}
          datepickerFormat={dateFormat}
          timeStamp={timeStamp}
          onValueChange={onValueChange}
          readOnly={readOnly}
        />
        <DatePickerDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          trigger={
            <Button
              id={`${id}-button`}
              variant='tertiary'
              icon={true}
              aria-controls='dialog'
              aria-haspopup='dialog'
              onClick={() => setIsDialogOpen(!isDialogOpen)}
              aria-expanded={isDialogOpen}
              disabled={readOnly}
              color='first'
            >
              <CalendarIcon />
            </Button>
          }
        >
          <DatePickerCalendar
            id={id}
            locale={locale}
            selectedDate={dayPickerDate}
            isOpen={isDialogOpen}
            onSelect={(date) => {
              handleDayPickerSelect(date);
              setIsDialogOpen(false);
            }}
            minDate={minDate}
            maxDate={maxDate}
            required={required}
            autoFocus={isMobile}
          />
        </DatePickerDialog>
      </div>
    </Grid>
  );
};
