import DateFnsUtils from '@date-io/date-fns';
import { endOfDay, formatDate, isValid, parseISO, setDefaultOptions, startOfDay } from 'date-fns';
import type { Locale } from 'date-fns/locale';

import { DateFlags } from 'src/types';
import { locales } from 'src/utils/dateLocales';

export const DatepickerMinDateDefault = '1900-01-01T12:00:00.000Z';
export const DatepickerMaxDateDefault = '2100-01-01T12:00:00.000Z';
export const DatepickerFormatDefault = 'DD.MM.YYYY';
export const DatepickerSaveFormatTimestamp = 'YYYY-MM-DDThh:mm:ss.sssZ';
export const PrettyDateAndTime = 'DD.MM.YYYY HH.mm.SS';
export const DatepickerSaveFormatNoTimestamp = 'YYYY-MM-DD';

export type DateResult =
  | {
      isValid: true;
      date: Date;
      input: undefined;
    }
  | {
      isValid: false;
      date: null;
      input: string;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const locale = window.navigator?.language || (window.navigator as any)?.userLanguage || 'nb';
setDefaultOptions({ locale });

/**
 * Moment used a non-standard format for dates, this is a work-around to prevent breaking changes
 * @deprecated
 */
function convertLegacyFormat(format: string): string {
  if (format === 'DD.MM.YYYY') {
    return 'dd.MM.y';
  }
  if (format === 'DD/MM/YYYY') {
    return 'dd/MM/yyyy';
  }
  if (format === 'YYYY-MM-DD') {
    return 'yyyy-MM-dd';
  }
  return format;
}

export function getDateFormat(format?: string, selectedLanguage = 'nb'): string {
  if (format) {
    return convertLegacyFormat(format);
  }
  return getLocale(selectedLanguage).formatLong?.date({ width: 'short' }) || DatepickerFormatDefault;
}

/**
 * The datepicker component does not support standard formats for input so the format we pass to the datepicker need to be massaged a bit.
 * @deprecated
 */
export function convertToDatepickerFormat(format: string): string {
  let pickerFormat = '';
  let token = '';
  let count = 0;
  for (let i = 0; i < format.length + 1; i++) {
    const char = i < format.length ? format[i].toLowerCase() : '';
    if (char === token) {
      count++;
    } else {
      if (token !== '') {
        switch (token) {
          case 'd':
            pickerFormat += 'DD';
            break;
          case 'm':
            pickerFormat += 'MM';
            break;
          case 'y':
            pickerFormat += 'YYYY';
            break;
          default:
            pickerFormat += token.repeat(count);
        }
      }
      token = char;
      count = 1;
    }
  }
  return pickerFormat;
}

export function getSaveFormattedDateString(date: Date | null, timestamp: boolean) {
  if (date && isValid(date)) {
    return (
      (!timestamp
        ? formatDate(date, DatepickerSaveFormatNoTimestamp)
        : formatDate(date, DatepickerSaveFormatTimestamp)) ?? ''
    );
  }
  return null;
}

export function getDateConstraint(dateOrFlag: string | DateFlags | undefined, constraint: 'min' | 'max'): Date {
  const shiftTime = constraint === 'min' ? startOfDay : endOfDay;

  if (dateOrFlag === DateFlags.Today) {
    return shiftTime(new Date());
  }

  const { date, isValid } = parseISOString(dateOrFlag);
  if (isValid) {
    return shiftTime(date);
  }
  if (constraint === 'min') {
    return shiftTime(parseISO(DatepickerMinDateDefault));
  } else {
    return shiftTime(parseISO(DatepickerMaxDateDefault));
  }
}

export function formatISOString(isoString: string | undefined, format: string, locale?: Locale): string | null {
  const isoDate = parseISOString(isoString).date;

  if (isoDate) {
    return formatDate(isoDate, format, { locale });
  } else {
    return null;
  }
}

export function isDate(date: string): boolean {
  return !isNaN(new Date(date).getTime());
}

export function getLocale(language: string): Locale {
  return locales[language] ?? locales.nb;
}

export function parseISOString(isoString: string | undefined): DateResult {
  const date = parseISO(isoString ?? '');
  if (isValid(date)) {
    return {
      isValid: true,
      date,
      input: undefined,
    };
  } else {
    return {
      isValid: false,
      date: null,
      input: isoString ?? '',
    };
  }
}

/**
 * This is a workaround for displaying and using different formats for the datepicker.
 * @deprecated
 */
export function getDateUtils(dateFormat: string, calculatedFormat: string) {
  class DateUtilsProvider extends DateFnsUtils {
    getDatePickerHeaderText(date: Date) {
      const locale1 = this.locale;
      console.log(locale1);
      /*const code = this.locale?.code?.substring(0, 2);
      if ((['nb', 'nn'] as (string | undefined)[]).includes(code)) {
        return dateFnsFormat(date, 'EEEE, d. MMMM', { locale: this.locale });
      } else if (code === 'en') {
        return dateFnsFormat(date, 'EEEE, MMMM d', { locale: this.locale });
      }
       */
      return super.getDatePickerHeaderText(date);
    }
    /*format(date: Date, propFormat: string) {
      return dateFnsFormat(date, propFormat === calculatedFormat ? dateFormat : propFormat, { locale: this.locale });
    }
    parse(value: string) {
      return parse(value, dateFormat, new Date());
    }*/
  }
  return DateUtilsProvider;
}
