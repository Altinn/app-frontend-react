import React, { useState } from 'react';
import type { MonthCaption } from 'react-day-picker';

import { CalendarIcon } from '@navikt/aksel-icons';
import { isValid as isValidDate } from 'date-fns';

import styles from 'src/app-components/Datepicker/Calendar.module.css';
import { DatePickerCalendar } from 'src/app-components/Datepicker/DatePickerCalendar';
import { DatePickerDialog } from 'src/app-components/Datepicker/DatepickerDialog';
import { DatePickerInput } from 'src/app-components/Datepicker/DatePickerInput';
import { getSaveFormattedDateString } from 'src/app-components/Datepicker/utils/dateHelpers';
import { Flex } from 'src/app-components/Flex/Flex';

export type DatePickerControlProps = {
  id: string;
  value: string;
  dateFormat: string;
  timeStamp?: boolean;
  onValueChange: (isoDateString: string) => void;
  readOnly?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  locale: string;
  isMobile?: boolean;
  DropdownCaption: typeof MonthCaption;
  buttonAriaLabel: string;
  calendarIconTitle: string;
};

export const DatePickerControl: React.FC<DatePickerControlProps> = ({
  id,
  value,
  dateFormat,
  timeStamp = true,
  onValueChange,
  readOnly = false,
  required = false,
  minDate,
  maxDate,
  locale,
  isMobile = false,
  buttonAriaLabel,
  DropdownCaption,
  calendarIconTitle,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dateValue = new Date(value);
  const dayPickerDate = isValidDate(dateValue) ? dateValue : undefined;

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
    <Flex
      container
      item
      size={{ xs: 12 }}
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
          id={id}
          buttonAriaLabel={buttonAriaLabel}
          readOnly={readOnly}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          trigger={<CalendarIcon title={calendarIconTitle} />}
        >
          <DatePickerCalendar
            id={id}
            locale={locale}
            selectedDate={dayPickerDate}
            onSelect={(date) => {
              handleDayPickerSelect(date);
              setIsDialogOpen(false);
            }}
            minDate={minDate}
            maxDate={maxDate}
            required={required}
            autoFocus={isMobile}
            DropdownCaption={DropdownCaption}
          />
        </DatePickerDialog>
      </div>
    </Flex>
  );
};
