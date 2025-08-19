import type { TimeFormat } from './TimePicker';
import type { TimeValue } from './timeConstraintUtils';

export interface DropdownColumn {
  type: 'hours' | 'minutes' | 'seconds' | 'period';
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  selectedValue: string | number;
}

export interface DropdownState {
  focusedColumn: number;
  focusedOption: number;
  isOpen: boolean;
}

export interface DropdownKeyResult {
  shouldNavigate: boolean;
  shouldSwitchColumn: boolean;
  shouldSelect: boolean;
  shouldClose: boolean;
  direction?: 'up' | 'down';
  columnDirection?: 'left' | 'right';
}

export const getDropdownColumns = (
  format: TimeFormat, 
  timeValue: TimeValue, 
  _constraints?: { minTime?: string; maxTime?: string }
): DropdownColumn[] => {
  const columns: DropdownColumn[] = [];
  const is12Hour = format.includes('a');
  const includesSeconds = format.includes('ss');

  // Hours column
  const hourOptions = is12Hour
    ? Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: (i + 1).toString().padStart(2, '0')
      }))
    : Array.from({ length: 24 }, (_, i) => ({
        value: i,
        label: i.toString().padStart(2, '0')
      }));

  const displayHours = is12Hour
    ? timeValue.hours === 0
      ? 12
      : timeValue.hours > 12
        ? timeValue.hours - 12
        : timeValue.hours
    : timeValue.hours;

  columns.push({
    type: 'hours',
    options: hourOptions,
    selectedValue: displayHours
  });

  // Minutes column
  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, '0')
  }));

  columns.push({
    type: 'minutes',
    options: minuteOptions,
    selectedValue: timeValue.minutes
  });

  // Seconds column (if included)
  if (includesSeconds) {
    const secondOptions = Array.from({ length: 60 }, (_, i) => ({
      value: i,
      label: i.toString().padStart(2, '0')
    }));

    columns.push({
      type: 'seconds',
      options: secondOptions,
      selectedValue: timeValue.seconds
    });
  }

  // Period column (if 12-hour format)
  if (is12Hour) {
    columns.push({
      type: 'period',
      options: [
        { value: 'AM', label: 'AM' },
        { value: 'PM', label: 'PM' }
      ],
      selectedValue: timeValue.period
    });
  }

  return columns;
};

export const getInitialFocusedOption = (column: DropdownColumn): number => {
  return column.options.findIndex(option => option.value === column.selectedValue);
};

export const getNextOption = (currentIndex: number, direction: 'up' | 'down', column: DropdownColumn): number => {
  const options = column.options;
  let nextIndex = currentIndex;

  if (direction === 'down') {
    nextIndex = (currentIndex + 1) % options.length;
  } else {
    nextIndex = (currentIndex - 1 + options.length) % options.length;
  }

  // Skip disabled options
  let iterations = 0;
  while (options[nextIndex]?.disabled && iterations < options.length) {
    if (direction === 'down') {
      nextIndex = (nextIndex + 1) % options.length;
    } else {
      nextIndex = (nextIndex - 1 + options.length) % options.length;
    }
    iterations++;
  }

  return nextIndex;
};

export const getNextColumn = (currentColumn: number, direction: 'left' | 'right', totalColumns: number): number => {
  if (direction === 'right') {
    return (currentColumn + 1) % totalColumns;
  } else {
    return (currentColumn - 1 + totalColumns) % totalColumns;
  }
};

export const handleDropdownKeyDown = (
  event: { key: string; preventDefault: () => void },
  _state: DropdownState,
  _columns: DropdownColumn[]
): DropdownKeyResult => {
  const result: DropdownKeyResult = {
    shouldNavigate: false,
    shouldSwitchColumn: false,
    shouldSelect: false,
    shouldClose: false
  };

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      result.shouldNavigate = true;
      result.direction = 'down';
      break;
    case 'ArrowUp':
      event.preventDefault();
      result.shouldNavigate = true;
      result.direction = 'up';
      break;
    case 'ArrowRight':
      event.preventDefault();
      result.shouldSwitchColumn = true;
      result.columnDirection = 'right';
      break;
    case 'ArrowLeft':
      event.preventDefault();
      result.shouldSwitchColumn = true;
      result.columnDirection = 'left';
      break;
    case 'Enter':
      event.preventDefault();
      result.shouldSelect = true;
      break;
    case 'Escape':
      event.preventDefault();
      result.shouldClose = true;
      break;
  }

  return result;
};