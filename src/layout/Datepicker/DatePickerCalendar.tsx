import React from 'react';
import { DayPicker } from 'react-day-picker';
import type { Matcher } from 'react-day-picker';

import styles from 'src/layout/Datepicker/Calendar.module.css';
import { DropdownCaption } from 'src/layout/Datepicker/DropdownCaption';
import { getLocale } from 'src/utils/dateHelpers';

export interface CalendarDialogProps {
  id: string;
  isOpen?: boolean;
  selectedDate: Date | undefined;
  onSelect: (value: Date) => void;
  maxDate?: Date;
  minDate?: Date;
  locale?: string;
  required?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
}

export const DatePickerCalendar = ({
  selectedDate,
  onSelect,
  minDate,
  maxDate,
  locale,
  required,
  autoFocus,
}: CalendarDialogProps) => {
  const currentLocale = getLocale(locale ?? 'nb');

  const disabledParams: Matcher[] = [];
  if (minDate) {
    disabledParams.push({ before: minDate });
  }
  if (maxDate) {
    disabledParams.push({ after: maxDate });
  }

  return (
    <DayPicker
      classNames={{
        selected: styles.selectedDate,
        disabled: styles.disabledDate,
        focused: styles.focusedDate,
        today: styles.today,
        month_grid: styles.calendar,
        day: styles.calendarDay,
        day_button: styles.calendarDayButton,
        month: styles.monthWrapper,
        weekday: styles.calendarWeekday,
      }}
      locale={currentLocale}
      today={new Date()}
      defaultMonth={selectedDate}
      disabled={disabledParams}
      weekStartsOn={1}
      mode='single'
      hideNavigation
      selected={selectedDate}
      required={required}
      captionLayout='label'
      onSelect={(date: Date | undefined) => {
        if (date) {
          onSelect(date);
        } else if (selectedDate) {
          onSelect(selectedDate);
        }
      }}
      components={{ MonthCaption: DropdownCaption }}
      autoFocus={autoFocus}
      style={{ minHeight: '405px', maxWidth: '100%' }}
    />
  );
};
