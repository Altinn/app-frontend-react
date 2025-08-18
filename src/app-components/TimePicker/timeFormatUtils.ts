import type { SegmentType } from 'src/app-components/TimePicker/keyboardNavigation';
import type { TimeValue } from 'src/app-components/TimePicker/timeConstraintUtils';
import type { TimeFormat } from 'src/app-components/TimePicker/TimePicker';

export const formatTimeValue = (time: TimeValue, format: TimeFormat): string => {
  const is12Hour = format.includes('a');
  const includesSeconds = format.includes('ss');

  let displayHours = time.hours;

  if (is12Hour) {
    if (displayHours === 0) {
      displayHours = 12; // Midnight = 12 AM
    } else if (displayHours > 12) {
      displayHours -= 12; // PM hours
    }
  }

  // Use different padding logic for 12-hour vs 24-hour format
  const hoursStr = is12Hour ? displayHours.toString() : displayHours.toString().padStart(2, '0');
  const minutesStr = time.minutes.toString().padStart(2, '0');
  const secondsStr = includesSeconds ? `:${time.seconds.toString().padStart(2, '0')}` : '';
  const periodStr = is12Hour ? ` ${time.period}` : '';

  return `${hoursStr}:${minutesStr}${secondsStr}${periodStr}`;
};

export const formatSegmentValue = (value: number | string, segmentType: SegmentType, format: TimeFormat): string => {
  if (segmentType === 'period') {
    return value.toString();
  }

  const numValue = typeof value === 'number' ? value : 0;

  if (segmentType === 'hours') {
    const is12Hour = format.includes('a');
    if (is12Hour) {
      let displayHour = numValue;
      if (displayHour === 0) {
        displayHour = 12; // Midnight
      } else if (displayHour > 12) {
        displayHour -= 12; // PM hours
      }
      return displayHour.toString().padStart(2, '0');
    }
  }

  return numValue.toString().padStart(2, '0');
};

export const parseSegmentInput = (
  input: string,
  segmentType: SegmentType,
  _format: TimeFormat,
): number | string | null => {
  if (!input.trim()) {
    return null;
  }

  if (segmentType === 'period') {
    const upperInput = input.toUpperCase();
    if (upperInput === 'AM' || upperInput === 'PM') {
      return upperInput as 'AM' | 'PM';
    }
    return null;
  }

  // Parse numeric input
  const numValue = parseInt(input, 10);
  if (isNaN(numValue)) {
    return null;
  }

  return numValue;
};

export const isValidSegmentInput = (input: string, segmentType: SegmentType, format: TimeFormat): boolean => {
  if (!input.trim()) {
    return false;
  }

  if (segmentType === 'period') {
    const upperInput = input.toUpperCase();
    return upperInput === 'AM' || upperInput === 'PM';
  }

  // Check if it contains only digits
  if (!/^\d+$/.test(input)) {
    return false;
  }

  const numValue = parseInt(input, 10);
  if (isNaN(numValue)) {
    return false;
  }

  // Single digits are always valid (will be auto-padded)
  if (input.length === 1) {
    return true;
  }

  // Validate complete values only
  if (segmentType === 'hours') {
    const is12Hour = format.includes('a');
    if (is12Hour) {
      return numValue >= 1 && numValue <= 12;
    } else {
      return numValue >= 0 && numValue <= 23;
    }
  }

  if (segmentType === 'minutes' || segmentType === 'seconds') {
    return numValue >= 0 && numValue <= 59;
  }

  return false;
};
