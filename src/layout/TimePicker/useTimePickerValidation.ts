import { FD } from 'src/features/formData/FormDataWrite';
import { type ComponentValidation, FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { useDataModelBindingsFor } from 'src/utils/layout/hooks';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { TimeFormat } from 'src/app-components/TimePicker/types';

const parseTimeString = (
  timeStr: string,
  format: TimeFormat,
): { hours: number; minutes: number; seconds?: number } | null => {
  if (!timeStr) {
    return null;
  }

  const is12Hour = format.includes('a');
  const includesSeconds = format.includes('ss');

  const cleanTime = timeStr.trim();
  const timeRegex = is12Hour
    ? includesSeconds
      ? /^(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i
      : /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    : includesSeconds
      ? /^(\d{1,2}):(\d{2}):(\d{2})$/
      : /^(\d{1,2}):(\d{2})$/;

  const match = cleanTime.match(timeRegex);
  if (!match) {
    return null;
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = includesSeconds ? parseInt(match[3], 10) : undefined;

  if (is12Hour) {
    if (hours < 1 || hours > 12) {
      return null;
    }
  } else {
    if (hours < 0 || hours > 23) {
      return null;
    }
  }

  if (minutes < 0 || minutes > 59) {
    return null;
  }
  if (seconds !== undefined && (seconds < 0 || seconds > 59)) {
    return null;
  }

  let adjustedHours = hours;
  if (is12Hour) {
    const period = match[includesSeconds ? 4 : 3];
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      adjustedHours += 12;
    }
    if (period.toUpperCase() === 'AM' && hours === 12) {
      adjustedHours = 0;
    }
  }

  return { hours: adjustedHours, minutes, seconds };
};

const timeToSeconds = (time: { hours: number; minutes: number; seconds?: number }): number =>
  time.hours * 3600 + time.minutes * 60 + (time.seconds ?? 0);

export function useTimePickerValidation(baseComponentId: string): ComponentValidation[] {
  const field = useDataModelBindingsFor(baseComponentId, 'TimePicker')?.simpleBinding;
  const component = useItemWhenType(baseComponentId, 'TimePicker');
  const data = FD.useDebouncedPick(field);
  const { minTime, maxTime, format = 'HH:mm' } = component || {};

  const timeString = typeof data === 'string' || typeof data === 'number' ? String(data) : undefined;
  if (!timeString) {
    return [];
  }

  const validations: ComponentValidation[] = [];

  const parsedTime = parseTimeString(timeString, format);
  if (!parsedTime) {
    validations.push({
      message: { key: 'time_picker.invalid_time_message', params: [format] },
      severity: 'error',
      source: FrontendValidationSource.Component,
      category: ValidationMask.Component,
    });
    return validations;
  }

  if (minTime) {
    const minParsed = parseTimeString(minTime, format);
    if (minParsed && timeToSeconds(parsedTime) < timeToSeconds(minParsed)) {
      validations.push({
        message: { key: 'time_picker.min_time_exceeded', params: [minTime] },
        severity: 'error',
        source: FrontendValidationSource.Component,
        category: ValidationMask.Component,
      });
    }
  }

  if (maxTime) {
    const maxParsed = parseTimeString(maxTime, format);
    if (maxParsed && timeToSeconds(parsedTime) > timeToSeconds(maxParsed)) {
      validations.push({
        message: { key: 'time_picker.max_time_exceeded', params: [maxTime] },
        severity: 'error',
        source: FrontendValidationSource.Component,
        category: ValidationMask.Component,
      });
    }
  }

  return validations;
}
