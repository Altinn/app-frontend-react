import type { SegmentType } from 'src/app-components/TimePicker/keyboardNavigation';
import type { TimeFormat } from 'src/app-components/TimePicker/TimePicker';

export interface SmartInputResult {
  displayValue: string;
  actualValue: number | string;
  shouldAutoAdvance: boolean;
  isBuilding: boolean;
}

/**
 * Get the valid range for a segment type and format
 */
export const getValidRange = (segmentType: SegmentType, format: TimeFormat): [number, number] => {
  if (segmentType === 'hours') {
    const is12Hour = format.includes('a');
    return is12Hour ? [1, 12] : [0, 23];
  }
  
  if (segmentType === 'minutes' || segmentType === 'seconds') {
    return [0, 59];
  }
  
  return [0, 0]; // period doesn't use numeric range
};

/**
 * Check if a first digit can accept a second digit within valid range
 */
export const canAcceptSecondDigit = (firstDigit: string, segmentType: SegmentType, format: TimeFormat): boolean => {
  if (segmentType === 'period') {
    return firstDigit === 'A' || firstDigit === 'P'; // Can build AM/PM
  }
  
  const [min, max] = getValidRange(segmentType, format);
  const firstNum = parseInt(firstDigit, 10);
  
  // Check if any valid two-digit number can start with this digit
  const minPossible = firstNum * 10; // e.g., "2" → 20
  const maxPossible = firstNum * 10 + 9; // e.g., "2" → 29
  
  // If the minimum possible exceeds our max, no second digit is valid
  if (minPossible > max) {
    return false;
  }
  
  // If there's any overlap between possible range and valid range
  return maxPossible >= min && minPossible <= max;
};

/**
 * Get the maximum valid value that can start with the given first digit
 */
export const getMaxValidValue = (firstDigit: string, segmentType: SegmentType, format: TimeFormat): number => {
  if (segmentType === 'period') {
    return 0; // Not applicable for period
  }
  
  const [min, max] = getValidRange(segmentType, format);
  const firstNum = parseInt(firstDigit, 10);
  
  if (!canAcceptSecondDigit(firstDigit, segmentType, format)) {
    return firstNum; // Only single digit possible
  }
  
  // Find the maximum valid two-digit number starting with firstDigit
  const maxPossible = firstNum * 10 + 9;
  return Math.min(maxPossible, max);
};

/**
 * Determine if we should auto-advance after typing this first digit
 */
export const shouldAutoAdvance = (firstDigit: string, segmentType: SegmentType, format: TimeFormat): boolean => {
  return !canAcceptSecondDigit(firstDigit, segmentType, format);
};

/**
 * Build a progressive value from first and second digits
 */
export const buildProgressiveValue = (
  firstDigit: string, 
  secondDigit: string, 
  segmentType: SegmentType, 
  format: TimeFormat
): number => {
  const [min, max] = getValidRange(segmentType, format);
  const firstNum = parseInt(firstDigit, 10);
  const secondNum = parseInt(secondDigit, 10);
  
  const proposedValue = firstNum * 10 + secondNum;
  
  // Cap to the overall maximum for the segment type, not just first digit max
  return Math.min(proposedValue, max);
};

/**
 * Process progressive typing where user builds two-digit values
 */
export const processProgressiveInput = (
  typedDigit: string,
  firstDigit: string | null,
  segmentType: SegmentType,
  format: TimeFormat,
  min?: number,
  max?: number
): SmartInputResult => {
  const [defaultMin, defaultMax] = getValidRange(segmentType, format);
  const actualMin = min ?? defaultMin;
  const actualMax = max ?? defaultMax;

  if (firstDigit === null) {
    // This is the first digit being typed
    const digit = parseInt(typedDigit, 10);
    
    // Apply constraints for single digit
    if (digit < actualMin || digit > actualMax) {
      const cappedValue = Math.max(actualMin, Math.min(digit, actualMax));
      return {
        displayValue: cappedValue.toString().padStart(2, '0'),
        actualValue: cappedValue,
        shouldAutoAdvance: true,
        isBuilding: false,
      };
    }
    
    const shouldAdvance = shouldAutoAdvance(typedDigit, segmentType, format);
    
    return {
      displayValue: digit.toString().padStart(2, '0'),
      actualValue: digit,
      shouldAutoAdvance: shouldAdvance,
      isBuilding: !shouldAdvance,
    };
  } else {
    // This is the second digit, building on the first
    const builtValue = buildProgressiveValue(firstDigit, typedDigit, segmentType, format);
    const finalValue = Math.max(actualMin, Math.min(builtValue, actualMax));
    
    return {
      displayValue: finalValue.toString().padStart(2, '0'),
      actualValue: finalValue,
      shouldAutoAdvance: true,
      isBuilding: false,
    };
  }
};

/**
 * Main smart input processing function
 * @param newInput - the new typed digit or full input value
 * @param currentInput - the previous input value (for progressive building context)
 * @param segmentType - type of segment being edited
 * @param format - time format
 * @param min - optional minimum constraint
 * @param max - optional maximum constraint
 */
export const getSmartInputResult = (
  newInput: string,
  currentInput: string,
  segmentType: SegmentType,
  format: TimeFormat,
  min?: number,
  max?: number
): SmartInputResult => {
  // Handle empty input
  if (!newInput.trim()) {
    return {
      displayValue: '',
      actualValue: segmentType === 'period' ? '' : 0,
      shouldAutoAdvance: false,
      isBuilding: false,
    };
  }

  // Handle period input differently
  if (segmentType === 'period') {
    const upperInput = newInput.toUpperCase();
    if (upperInput === 'AM' || upperInput === 'PM') {
      return {
        displayValue: upperInput,
        actualValue: upperInput,
        shouldAutoAdvance: true,
        isBuilding: false,
      };
    } else {
      return {
        displayValue: upperInput,
        actualValue: upperInput,
        shouldAutoAdvance: false,
        isBuilding: upperInput === 'A' || upperInput === 'P',
      };
    }
  }

  // Handle numeric input
  if (!/^\d+$/.test(newInput)) {
    return {
      displayValue: '',
      actualValue: 0,
      shouldAutoAdvance: false,
      isBuilding: false,
    };
  }

  // Detect progressive building pattern:
  // - If currentInput is a single digit and newInput is a single digit
  // - We're building from currentInput + newInput
  if (currentInput.length === 1 && newInput.length === 1 && /^\d$/.test(currentInput)) {
    return processProgressiveInput(newInput, currentInput, segmentType, format, min, max);
  }

  if (newInput.length === 1) {
    // Single digit input - treat as first digit
    return processProgressiveInput(newInput, null, segmentType, format, min, max);
  } else if (newInput.length === 2) {
    // Two-digit input - treat as complete two-digit value
    const firstDigit = newInput[0];
    const secondDigit = newInput[1];
    const builtValue = buildProgressiveValue(firstDigit, secondDigit, segmentType, format);
    const [defaultMin, defaultMax] = getValidRange(segmentType, format);
    const actualMin = min ?? defaultMin;
    const actualMax = max ?? defaultMax;
    const finalValue = Math.max(actualMin, Math.min(builtValue, actualMax));
    
    return {
      displayValue: finalValue.toString().padStart(2, '0'),
      actualValue: finalValue,
      shouldAutoAdvance: true,
      isBuilding: false,
    };
  }

  // Fallback for longer input - just take first two digits
  const truncated = newInput.substring(0, 2);
  return getSmartInputResult(truncated, currentInput, segmentType, format, min, max);
};