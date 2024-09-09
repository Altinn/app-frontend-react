import React, { useId, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import type { Matcher } from 'react-day-picker';

import styles from 'src/layout/Datepicker/Calendar.module.css';
import DropdownCaption from 'src/layout/Datepicker/DropdownCaption';

export interface CalendarDialogProps {
  id: string;
  isOpen?: boolean;
  month: Date;
  setMonth: (month: Date) => void;
  selectedDate: Date | undefined;
  onSelect?: (value: Date) => void;
  maxDate: string;
  minDate: string;
}

export const DatePickerCalendar = ({
  id,
  isOpen = false,
  month,
  setMonth,
  selectedDate,
  onSelect,
  minDate,
  maxDate,
}: CalendarDialogProps) => {
  const dialogId = useId();
  const headerId = useId();
  const calendarRef = useRef<HTMLDivElement>(null);

  //Add event listner for closing calendar on click outside
  /*useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsDialogOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);*/

  const disabledDates: Matcher[] = [];

  const matcher = { before: new Date(minDate), after: new Date(maxDate) };
  disabledDates.push(matcher);
  return (
    isOpen && (
      <div
        ref={calendarRef}
        style={{
          position: 'absolute',
          display: 'flex',
          zIndex: 10,
          backgroundColor: 'white',
          boxShadow: 'gray 2px 2px 6px 0px',
          padding: '10px',
          flexDirection: 'column',
        }}
        id={dialogId}
        aria-modal
        aria-labelledby={headerId}
      >
        <DayPicker
          classNames={{
            selected: styles.selectedDate,
            disabled: styles.disabledDate,
            focused: styles.focusedDate,
            today: styles.today,
            day_button: styles.dayButton,
            month: styles.monthWrapper,
          }}
          today={new Date()}
          disabled={disabledDates}
          month={month}
          onMonthChange={setMonth}
          weekStartsOn={1}
          autoFocus={false}
          mode='single'
          hideNavigation
          selected={selectedDate}
          required={true}
          captionLayout='label'
          onSelect={onSelect}
          components={{ MonthCaption: DropdownCaption }}
        />
      </div>
    )
  );
};
