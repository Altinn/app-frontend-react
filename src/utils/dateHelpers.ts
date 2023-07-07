import moment from 'moment';
import type { Moment } from 'moment';

import { DateFlags } from 'src/types';

export const DatepickerMinDateDefault = '1900-01-01T12:00:00.000Z';
export const DatepickerMaxDateDefault = '2100-01-01T12:00:00.000Z';
export const DatepickerFormatDefault = 'DD.MM.YYYY';
export const DatepickerSaveFormatTimestamp = 'YYYY-MM-DDThh:mm:ss.sssZ';
export const DatepickerSaveFormatNoTimestamp = 'YYYY-MM-DD';

export function getISOString(potentialDate: string | undefined): string | undefined {
  if (!potentialDate) {
    return undefined;
  }

  const { date, isValid } = parseISOString(potentialDate);
  if (isValid) {
    date.set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0);
    return date.toISOString();
  }
  return undefined;
}

const locale = window.navigator?.language || (window.navigator as any)?.userLanguage || 'nb';
moment.locale(locale);

export function getDateFormat(format?: string, selectedLanguage = 'nb'): string {
  if (format) {
    return format;
  }
  return moment.localeData(selectedLanguage).longDateFormat('L') || DatepickerFormatDefault;
}

export function getDateString(date: Moment | null, timestamp: boolean) {
  return (
    (timestamp === false
      ? formatDate(date, DatepickerSaveFormatNoTimestamp)
      : formatDate(date, DatepickerSaveFormatTimestamp)) ?? ''
  );
}

export function getDateConstraint(dateOrFlag: string | DateFlags | undefined, constraint: 'min' | 'max'): string {
  if (dateOrFlag === DateFlags.Today) {
    return moment().set('hour', 12).set('minute', 0).set('seconds', 0).set('milliseconds', 0).toISOString();
  }
  const date = getISOString(dateOrFlag);
  if (typeof date === 'string') {
    return date;
  }
  if (constraint === 'min') {
    return DatepickerMinDateDefault;
  } else {
    return DatepickerMaxDateDefault;
  }
}

export function formatISOString(isoString: string | undefined, format: string): string | null {
  return formatDate(parseISOString(isoString).date, format);
}

export function isValidDate(date: Moment | null | undefined): boolean {
  return Boolean(date?.isValid());
}

export type DateResult =
  | {
      isValid: true;
      date: Moment;
      input: undefined;
    }
  | {
      isValid: false;
      date: null;
      input: string;
    };
export function parseISOString(isoString: string | undefined): DateResult {
  const date = moment(isoString, moment.ISO_8601);
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

export function formatDate(date: Moment | null | undefined, format: string): string | null {
  if (isValidDate(date)) {
    return (date as Moment).format(format);
  }
  return null;
}
