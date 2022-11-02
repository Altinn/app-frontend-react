import moment from 'moment';

import { DateFlags } from 'src/types';
import { DatePickerFormatDefault } from 'src/utils/validation';

/*
  Creates a specific date based on different flags (DatepickerRestrictionFlags)
  Returns moment.Moment or null
*/
export function getFlagBasedDate(flag: DateFlags): string | undefined {
  if (flag === DateFlags.Today) {
    return moment()
      .set('hour', 12)
      .set('minute', 0)
      .set('seconds', 0)
      .set('milliseconds', 0)
      .toISOString();
  }

  return undefined;
}

export function getISOString(
  potentialDate: string | undefined,
): string | undefined {
  if (!potentialDate) {
    return undefined;
  }

  const momentDate = moment(potentialDate);
  return momentDate.isValid() ? momentDate.toISOString() : undefined;
}

const locale =
  window.navigator?.language || (window.navigator as any)?.userLanguage || 'nb';
moment.locale(locale);

export function getDateFormat(format?: string): string {
  return (
    moment.localeData().longDateFormat('L') || format || DatePickerFormatDefault
  );
}
