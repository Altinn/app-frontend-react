import { endOfDay, format, isValid, parseISO, startOfDay } from 'date-fns';

import { DateFlags } from 'src/types';
import { locales } from 'src/utils/dateLocales';

export const DatepickerMinDateDefault = '1900-01-01';
export const DatepickerMaxDateDefault = '2100-01-01';
export const DatepickerFormatDefault = 'dd.MM.yyyy';
export const DatepickerSaveFormatTimestamp = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";
export const DatepickerSaveFormatNoTimestamp = 'yyyy-MM-dd';

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

export function getSaveFormattedDateString(date: Date | null, timestamp: boolean) {
  return (
    (timestamp === false
      ? formatDate(date, DatepickerSaveFormatNoTimestamp)
      : formatDate(date, DatepickerSaveFormatTimestamp)) ?? ''
  );
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
  return formatDate(parseISOString(isoString).date, format, locale);
}

export function isValidDate(date: Date | null | undefined): boolean {
  return isValid(date);
}

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
export function parseISOString(isoString: string | undefined): DateResult {
  const date = parseISO(isoString ?? '');
  if (isValidDate(date)) {
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

export function formatDate(date: Date | null | undefined, dateFormat: string, locale?: Locale): string | null {
  if (isValidDate(date)) {
    return format(date as Date, dateFormat, { locale });
  }
  return null;
}

export function getLocale(language: string): Locale {
  return locales[language] ?? locales.nb;
}
