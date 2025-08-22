import type { TimeFormat } from 'src/app-components/TimePicker/components/TimePicker';
import type { SegmentType } from 'src/app-components/TimePicker/utils/keyboardNavigation';

export interface SegmentTypingResult {
  value: string;
  shouldAdvance: boolean;
}

export interface SegmentBuffer {
  displayValue: string;
  actualValue: number | string | null;
  isComplete: boolean;
}

/**
 * Process hour input with Chrome-like smart coercion
 */
export const processHourInput = (digit: string, currentBuffer: string, is12Hour: boolean): SegmentTypingResult => {
  const digitNum = parseInt(digit, 10);

  if (currentBuffer === '') {
    // First digit
    if (is12Hour) {
      // 12-hour mode: 0-1 allowed, 2-9 coerced to 0X
      if (digitNum >= 0 && digitNum <= 1) {
        return { value: digit, shouldAdvance: false };
      } else {
        // Coerce 2-9 to 0X and advance
        return { value: `0${digit}`, shouldAdvance: true };
      }
    } else {
      // 24-hour mode: 0-2 allowed, 3-9 coerced to 0X
      if (digitNum >= 0 && digitNum <= 2) {
        return { value: digit, shouldAdvance: false };
      } else {
        // Coerce 3-9 to 0X and advance
        return { value: `0${digit}`, shouldAdvance: true };
      }
    }
  } else {
    // Second digit
    const firstDigit = parseInt(currentBuffer, 10);
    let finalValue: string;

    if (is12Hour) {
      if (firstDigit === 0) {
        // 01-09 valid, but 00 becomes 01
        finalValue = digitNum === 0 ? '01' : `0${digit}`;
      } else if (firstDigit === 1) {
        // 10-12 valid, >12 coerced to 12
        finalValue = digitNum > 2 ? '12' : `1${digit}`;
      } else {
        finalValue = `${currentBuffer}${digit}`;
      }
    } else {
      // 24-hour mode
      if (firstDigit === 2) {
        // If first digit is 2, restrict to 20-23, coerce >23 to 23
        finalValue = digitNum > 3 ? '23' : `2${digit}`;
      } else {
        finalValue = `${currentBuffer}${digit}`;
      }
    }

    return { value: finalValue, shouldAdvance: true };
  }
};

/**
 * Process minute/second input with coercion
 */
export const processMinuteInput = (digit: string, currentBuffer: string): SegmentTypingResult => {
  const digitNum = parseInt(digit, 10);

  if (currentBuffer === '') {
    // First digit: 0-5 allowed, 6-9 coerced to 0X
    if (digitNum >= 0 && digitNum <= 5) {
      return { value: digit, shouldAdvance: false };
    } else {
      // Coerce 6-9 to 0X (complete, but don't advance - Chrome behavior)
      return { value: `0${digit}`, shouldAdvance: false };
    }
  } else if (currentBuffer.length === 1) {
    // Second digit: always valid 0-9
    return { value: `${currentBuffer}${digit}`, shouldAdvance: false };
  } else {
    // Already has 2 digits - restart with new input
    if (digitNum >= 0 && digitNum <= 5) {
      return { value: digit, shouldAdvance: false };
    } else {
      // Coerce 6-9 to 0X
      return { value: `0${digit}`, shouldAdvance: false };
    }
  }
};

/**
 * Process period (AM/PM) input
 */
export const processPeriodInput = (key: string, currentPeriod: 'AM' | 'PM'): 'AM' | 'PM' => {
  const keyUpper = key.toUpperCase();
  if (keyUpper === 'A') {
    return 'AM';
  }
  if (keyUpper === 'P') {
    return 'PM';
  }
  return currentPeriod; // No change for invalid input
};

/**
 * Check if a key should trigger navigation
 */
export const isNavigationKey = (key: string): boolean =>
  [':', '.', ',', ' ', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key);

/**
 * Process segment buffer to get display and actual values
 */
export const processSegmentBuffer = (buffer: string, segmentType: SegmentType, _is12Hour: boolean): SegmentBuffer => {
  if (buffer === '') {
    return {
      displayValue: '--',
      actualValue: null,
      isComplete: false,
    };
  }

  if (segmentType === 'period') {
    return {
      displayValue: buffer,
      actualValue: buffer,
      isComplete: buffer === 'AM' || buffer === 'PM',
    };
  }

  const numValue = parseInt(buffer, 10);
  const displayValue = buffer.length === 1 ? `0${buffer}` : buffer;

  return {
    displayValue,
    actualValue: numValue,
    isComplete:
      buffer.length === 2 || (buffer.length === 1 && (numValue > 2 || (segmentType === 'minutes' && numValue > 5))),
  };
};

/**
 * Clear a segment to empty state
 */
export const clearSegment = (): { displayValue: string; actualValue: null } => ({
  displayValue: '--',
  actualValue: null,
});

/**
 * Commit segment value (fill empty minutes with 00, etc.)
 */
export const commitSegmentValue = (value: number | string | null, segmentType: SegmentType): number | string => {
  if (value === null) {
    if (segmentType === 'minutes' || segmentType === 'seconds') {
      return 0; // Fill empty minutes/seconds with 00
    }
    return 0; // Default for hours too
  }
  return value;
};

/**
 * Coerce value to valid range
 */
export const coerceToValidRange = (value: number, segmentType: SegmentType, is12Hour: boolean): number => {
  if (segmentType === 'hours') {
    if (is12Hour) {
      if (value < 1) {
        return 1;
      }
      if (value > 12) {
        return 12;
      }
    } else {
      if (value < 0) {
        return 0;
      }
      if (value > 23) {
        return 23;
      }
    }
  } else if (segmentType === 'minutes' || segmentType === 'seconds') {
    if (value < 0) {
      return 0;
    }
    if (value > 59) {
      return 59;
    }
  }
  return value;
};

/**
 * Determine if segment should auto-advance
 */
export const shouldAdvanceSegment = (segmentType: SegmentType, buffer: string, is12Hour: boolean): boolean => {
  if (segmentType === 'hours') {
    if (buffer.length === 2) {
      return true;
    }
    if (buffer.length === 1) {
      const digit = parseInt(buffer, 10);
      if (is12Hour) {
        return digit >= 2; // 2-9 get coerced and advance
      } else {
        return digit >= 3; // 3-9 get coerced and advance
      }
    }
  }
  // Minutes and seconds don't auto-advance (Chrome behavior)
  return false;
};

/**
 * Handle character input for segment typing
 */
export const handleSegmentCharacterInput = (
  char: string,
  segmentType: SegmentType,
  currentBuffer: string,
  format: TimeFormat,
): {
  newBuffer: string;
  shouldAdvance: boolean;
  shouldNavigate: boolean;
} => {
  const is12Hour = format.includes('a');

  // Handle navigation characters
  if (isNavigationKey(char)) {
    return {
      newBuffer: currentBuffer,
      shouldAdvance: false,
      shouldNavigate: char === ':' || char === '.' || char === ',' || char === ' ',
    };
  }

  // Handle period segment
  if (segmentType === 'period') {
    const newPeriod = processPeriodInput(char, 'AM');
    return {
      newBuffer: newPeriod,
      shouldAdvance: false,
      shouldNavigate: false,
    };
  }

  // Handle numeric segments
  if (!/^\d$/.test(char)) {
    // Invalid character for numeric segment
    return {
      newBuffer: currentBuffer,
      shouldAdvance: false,
      shouldNavigate: false,
    };
  }

  let result: SegmentTypingResult;

  if (segmentType === 'hours') {
    result = processHourInput(char, currentBuffer, is12Hour);
  } else {
    result = processMinuteInput(char, currentBuffer);
  }

  return {
    newBuffer: result.value,
    shouldAdvance: result.shouldAdvance,
    shouldNavigate: false,
  };
};
