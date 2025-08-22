import type { SegmentType } from 'src/app-components/TimePicker/utils/keyboardNavigation';

export interface DropdownOption {
  value: number | string;
  label: string;
}

/**
 * Round a value to the nearest step
 */
export const roundToStep = (value: number, step: number): number => Math.round(value / step) * step;

/**
 * Get initial highlight index based on current value or system time
 */
export const getInitialHighlightIndex = (
  currentValue: number | string | null,
  options: DropdownOption[],
  segmentType?: SegmentType,
  step?: number,
  systemTime?: Date,
): number => {
  // If we have a current value, find it in options
  if (currentValue !== null && currentValue !== undefined) {
    const index = options.findIndex((opt) => opt.value === currentValue);
    return index >= 0 ? index : 0;
  }

  // If no value, use system time (only for hours/minutes)
  if (systemTime && segmentType && step) {
    let targetValue: number;

    if (segmentType === 'hours') {
      targetValue = systemTime.getHours();
    } else if (segmentType === 'minutes') {
      targetValue = roundToStep(systemTime.getMinutes(), step);
    } else {
      return 0;
    }

    const index = options.findIndex((opt) => opt.value === targetValue);
    return index >= 0 ? index : 0;
  }

  return 0;
};

/**
 * Get next index for up/down navigation
 */
export const getNextIndex = (currentIndex: number, direction: 'up' | 'down', totalOptions: number): number => {
  if (direction === 'up') {
    return Math.max(0, currentIndex - 1);
  } else {
    return Math.min(totalOptions - 1, currentIndex + 1);
  }
};

/**
 * Get index for page up/down navigation (±60 minutes worth of options)
 */
export const getPageJumpIndex = (
  currentIndex: number,
  direction: 'up' | 'down',
  totalOptions: number,
  stepMinutes: number,
): number => {
  // Calculate how many items represent 60 minutes
  const itemsToJump = Math.max(1, Math.floor(60 / stepMinutes));

  if (direction === 'up') {
    return Math.max(0, currentIndex - itemsToJump);
  } else {
    return Math.min(totalOptions - 1, currentIndex + itemsToJump);
  }
};

/**
 * Get first index (Home key)
 */
export const getHomeIndex = (): number => 0;

/**
 * Get last index (End key)
 */
export const getEndIndex = (totalOptions: number): number => totalOptions - 1;

/**
 * Find nearest option index for a given value
 */
export const findNearestOptionIndex = (value: number | string, options: DropdownOption[]): number => {
  if (options.length === 0) {
    return 0;
  }

  // First try exact match
  const exactIndex = options.findIndex((opt) => opt.value === value);
  if (exactIndex >= 0) {
    return exactIndex;
  }

  // For string values (period), return 0 if no match
  if (typeof value === 'string') {
    return 0;
  }

  // Find nearest numeric value
  let nearestIndex = 0;
  let nearestDiff = Math.abs(Number(options[0].value) - value);

  for (let i = 1; i < options.length; i++) {
    const diff = Math.abs(Number(options[i].value) - value);
    if (diff < nearestDiff) {
      nearestDiff = diff;
      nearestIndex = i;
    }
  }

  return nearestIndex;
};

/**
 * Calculate scroll position to center an option in view
 */
export const calculateScrollPosition = (index: number, containerHeight: number, itemHeight: number): number => {
  // Calculate position to center the item
  const itemTop = index * itemHeight;
  const scrollTo = itemTop - containerHeight / 2 + itemHeight / 2;

  // Don't scroll negative
  return Math.max(0, scrollTo);
};

/**
 * Determine if we should scroll to make option visible
 */
export const shouldScrollToOption = (
  index: number,
  currentScrollTop: number,
  containerHeight: number,
  itemHeight: number,
): boolean => {
  const itemTop = index * itemHeight;
  const itemBottom = itemTop + itemHeight;
  const viewportTop = currentScrollTop;
  const viewportBottom = currentScrollTop + containerHeight;

  // Check if item is fully visible
  const isFullyVisible = itemTop >= viewportTop && itemBottom <= viewportBottom;

  return !isFullyVisible;
};
