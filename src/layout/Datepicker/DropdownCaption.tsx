import React from 'react';
import {
  defaultLocale,
  formatMonthDropdown,
  labelMonthDropdown,
  labelNext,
  labelPrevious,
  labelYearDropdown,
  useDayPicker,
} from 'react-day-picker';
import type { MonthCaptionProps } from 'react-day-picker';

import { Button, Combobox } from '@digdir/designsystemet-react';
import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { addYears, isSameYear, max, min, setMonth, setYear, startOfMonth, startOfYear, subYears } from 'date-fns';

import { Lang } from 'src/features/language/Lang';
import comboboxClasses from 'src/styles/combobox.module.css';

export const DropdownCaption = ({ calendarMonth, id }: MonthCaptionProps) => {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker();

  const handleYearChange = (year: string) => {
    const newMonth = setYear(startOfMonth(calendarMonth.date), Number(year));
    goToMonth(startOfMonth(min([max([newMonth])])));
  };

  const handleMonthChange = (month: string) => {
    goToMonth(setMonth(startOfMonth(calendarMonth.date), Number(month)));
  };

  const getMonths = (start: Date, end: Date, current: Date): Date[] => {
    const dropdownMonths: Date[] = [];

    if (isSameYear(start, end)) {
      const date = startOfMonth(start);
      for (let month = start.getMonth(); month <= end.getMonth(); month++) {
        dropdownMonths.push(setMonth(date, month));
      }
    } else if (isSameYear(current, end)) {
      const date = startOfMonth(new Date());
      for (let month = 0; month <= end.getMonth(); month++) {
        dropdownMonths.push(setMonth(date, month));
      }
    } else if (isSameYear(current, start)) {
      const date = startOfMonth(start);
      for (let month = date.getMonth(); month <= 11; month++) {
        dropdownMonths.push(setMonth(date, month));
      }
    } else {
      const date = startOfMonth(new Date());
      for (let month = 0; month <= 11; month++) {
        dropdownMonths.push(setMonth(date, month));
      }
    }

    if (!dropdownMonths.map((d) => d.getMonth()).includes(current.getMonth())) {
      dropdownMonths.push(current);
    }
    dropdownMonths.sort((a, b) => a.getMonth() - b.getMonth());

    return dropdownMonths;
  };

  const getYears = (start: Date, end: Date, currentYear: number): Date[] => {
    const years: Date[] = [];
    const fromYear = start.getFullYear();
    const toYear = end.getFullYear();
    for (let year = fromYear; year <= toYear; year++) {
      years.push(setYear(startOfYear(new Date()), year));
    }

    if (fromYear > currentYear || toYear < currentYear) {
      years.push(setYear(startOfYear(new Date()), currentYear));
    }

    years.sort((a, b) => a.getFullYear() - b.getFullYear());
    return years;
  };

  const fromDate = subYears(calendarMonth.date, 100);
  const toDate = addYears(calendarMonth.date, 100);

  const years = getYears(fromDate, toDate, calendarMonth.date.getFullYear()).reverse();
  const months = getMonths(fromDate, toDate, calendarMonth.date);
  const previousLabel = labelPrevious(previousMonth, { locale: defaultLocale });
  const nextLabel = labelNext(nextMonth, { locale: defaultLocale });
  const yearDropdownLabel = labelYearDropdown({ locale: defaultLocale });
  const MonthDropdownLabel = labelMonthDropdown({ locale: defaultLocale });

  return (
    <>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <Button
          icon={true}
          color='second'
          variant='tertiary'
          //aria-label={previousLabel}
          disabled={!previousMonth}
          onClick={() => previousMonth && goToMonth(previousMonth)}
        >
          <ArrowLeftIcon />
        </Button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Combobox
            style={{ width: '100px' }}
            id={id}
            size='sm'
            value={[calendarMonth.date.getFullYear().toString()]}
            onValueChange={(years) => handleYearChange(years[0])}
            aria-label={'Year'}
            className={comboboxClasses.container}
            portal={false}
          >
            <Combobox.Empty>
              <Lang id={'form_filler.no_options_found'} />
            </Combobox.Empty>
            {years.map((date) => (
              <Combobox.Option
                key={date.getFullYear().toString()}
                value={date.getFullYear().toString()}
                displayValue={date.getFullYear().toString()}
              >
                <Lang id={date.getFullYear().toString()} />
              </Combobox.Option>
            ))}
          </Combobox>
          <Combobox
            style={{ width: '150px' }}
            id={id}
            size='sm'
            value={[calendarMonth.date.getMonth().toString()]}
            onValueChange={(months) => handleMonthChange(months[0])}
            aria-label={'Month'}
            className={comboboxClasses.container}
            portal={false}
          >
            <Combobox.Empty>
              <Lang id={'form_filler.no_options_found'} />
            </Combobox.Empty>
            {months.map((value) => (
              <Combobox.Option
                key={value.getMonth()}
                value={value.getMonth().toString()}
                displayValue={formatMonthDropdown(value.getMonth(), defaultLocale)}
              >
                <Lang id={formatMonthDropdown(value.getMonth(), defaultLocale)} />
              </Combobox.Option>
            ))}
          </Combobox>
        </div>
        <Button
          icon={true}
          color='second'
          variant='tertiary'
          //aria-label={nextLabel}
          disabled={!nextMonth}
          onClick={() => nextMonth && goToMonth(nextMonth)}
        >
          <ArrowRightIcon />
        </Button>
      </div>
      {/*<WeekRow displayMonth={displayMonth} />*/}
    </>
  );
};

export default DropdownCaption;
