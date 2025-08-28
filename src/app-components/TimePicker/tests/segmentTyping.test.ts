import {
  clearSegment,
  coerceToValidRange,
  commitSegmentValue,
  isNavigationKey,
  processHourInput,
  processMinuteInput,
  processPeriodInput,
  processSegmentBuffer,
  shouldAdvanceSegment,
} from 'src/app-components/TimePicker/utils/segmentTyping';

describe('segmentTyping', () => {
  describe('processHourInput - 24 hour mode', () => {
    it('should accept 0-2 as first digit in 24h mode', () => {
      expect(processHourInput('0', '', false)).toEqual({ value: '0', shouldAdvance: false });
      expect(processHourInput('1', '', false)).toEqual({ value: '1', shouldAdvance: false });
      expect(processHourInput('2', '', false)).toEqual({ value: '2', shouldAdvance: false });
    });

    it('should coerce 3-9 as first digit to 0X and advance', () => {
      expect(processHourInput('3', '', false)).toEqual({ value: '03', shouldAdvance: true });
      expect(processHourInput('7', '', false)).toEqual({ value: '07', shouldAdvance: true });
      expect(processHourInput('9', '', false)).toEqual({ value: '09', shouldAdvance: true });
    });

    it('should allow 0-9 as second digit when first is 0-1', () => {
      expect(processHourInput('5', '0', false)).toEqual({ value: '05', shouldAdvance: true });
      expect(processHourInput('9', '1', false)).toEqual({ value: '19', shouldAdvance: true });
    });

    it('should restrict to 0-3 as second digit when first is 2', () => {
      expect(processHourInput('0', '2', false)).toEqual({ value: '20', shouldAdvance: true });
      expect(processHourInput('3', '2', false)).toEqual({ value: '23', shouldAdvance: true });
      expect(processHourInput('4', '2', false)).toEqual({ value: '23', shouldAdvance: true });
      expect(processHourInput('9', '2', false)).toEqual({ value: '23', shouldAdvance: true });
    });

    it('should auto-advance after 2 valid digits', () => {
      expect(processHourInput('3', '1', false)).toEqual({ value: '13', shouldAdvance: true });
      expect(processHourInput('0', '0', false)).toEqual({ value: '00', shouldAdvance: true });
    });
  });

  describe('processHourInput - 12 hour mode', () => {
    it('should accept 0-1 as first digit in 12h mode', () => {
      expect(processHourInput('0', '', true)).toEqual({ value: '0', shouldAdvance: false });
      expect(processHourInput('1', '', true)).toEqual({ value: '1', shouldAdvance: false });
    });

    it('should coerce 2-9 as first digit to 0X and advance in 12h mode', () => {
      expect(processHourInput('2', '', true)).toEqual({ value: '02', shouldAdvance: true });
      expect(processHourInput('5', '', true)).toEqual({ value: '05', shouldAdvance: true });
      expect(processHourInput('9', '', true)).toEqual({ value: '09', shouldAdvance: true });
    });

    it('should allow 1-9 as second digit when first is 0 in 12h mode', () => {
      expect(processHourInput('1', '0', true)).toEqual({ value: '01', shouldAdvance: true });
      expect(processHourInput('9', '0', true)).toEqual({ value: '09', shouldAdvance: true });
    });

    it('should allow 0-2 as second digit when first is 1 in 12h mode', () => {
      expect(processHourInput('0', '1', true)).toEqual({ value: '10', shouldAdvance: true });
      expect(processHourInput('2', '1', true)).toEqual({ value: '12', shouldAdvance: true });
      expect(processHourInput('3', '1', true)).toEqual({ value: '12', shouldAdvance: true });
    });

    it('should not allow 00 in 12h mode', () => {
      expect(processHourInput('0', '0', true)).toEqual({ value: '01', shouldAdvance: true });
    });
  });

  describe('processMinuteInput', () => {
    it('should accept 0-5 as first digit', () => {
      expect(processMinuteInput('0', '')).toEqual({ value: '0', shouldAdvance: false });
      expect(processMinuteInput('3', '')).toEqual({ value: '3', shouldAdvance: false });
      expect(processMinuteInput('5', '')).toEqual({ value: '5', shouldAdvance: false });
    });

    it('should coerce 6-9 as first digit to 0X', () => {
      expect(processMinuteInput('6', '')).toEqual({ value: '06', shouldAdvance: false });
      expect(processMinuteInput('8', '')).toEqual({ value: '08', shouldAdvance: false });
      expect(processMinuteInput('9', '')).toEqual({ value: '09', shouldAdvance: false });
    });

    it('should allow 0-9 as second digit', () => {
      expect(processMinuteInput('0', '0')).toEqual({ value: '00', shouldAdvance: false });
      expect(processMinuteInput('9', '5')).toEqual({ value: '59', shouldAdvance: false });
    });

    it('should not auto-advance after 2 digits (stays selected)', () => {
      expect(processMinuteInput('5', '2')).toEqual({ value: '25', shouldAdvance: false });
      expect(processMinuteInput('0', '0')).toEqual({ value: '00', shouldAdvance: false });
    });

    it('should restart with new input after reaching 2 digits', () => {
      expect(processMinuteInput('3', '25')).toEqual({ value: '3', shouldAdvance: false });
      expect(processMinuteInput('7', '59')).toEqual({ value: '07', shouldAdvance: false });
    });
  });

  describe('processPeriodInput', () => {
    it('should toggle to AM on A/a input', () => {
      expect(processPeriodInput('a', 'PM')).toBe('AM');
      expect(processPeriodInput('A', 'PM')).toBe('AM');
      expect(processPeriodInput('a', 'AM')).toBe('AM');
    });

    it('should toggle to PM on P/p input', () => {
      expect(processPeriodInput('p', 'AM')).toBe('PM');
      expect(processPeriodInput('P', 'AM')).toBe('PM');
      expect(processPeriodInput('p', 'PM')).toBe('PM');
    });

    it('should return current period for invalid input', () => {
      expect(processPeriodInput('x', 'AM')).toBe('AM');
      expect(processPeriodInput('1', 'PM')).toBe('PM');
    });
  });

  describe('processSegmentBuffer', () => {
    it('should handle single digit buffer', () => {
      expect(processSegmentBuffer('5', 'hours', false)).toEqual({
        displayValue: '05',
        actualValue: 5,
        isComplete: true,
      });
    });

    it('should handle two digit buffer', () => {
      expect(processSegmentBuffer('15', 'hours', false)).toEqual({
        displayValue: '15',
        actualValue: 15,
        isComplete: true,
      });
    });

    it('should handle empty buffer', () => {
      expect(processSegmentBuffer('', 'hours', false)).toEqual({
        displayValue: '--',
        actualValue: null,
        isComplete: false,
      });
    });

    it('should handle period segment', () => {
      expect(processSegmentBuffer('AM', 'period', false)).toEqual({
        displayValue: 'AM',
        actualValue: 'AM',
        isComplete: true,
      });
    });
  });

  describe('isNavigationKey', () => {
    it('should identify navigation keys', () => {
      expect(isNavigationKey(':')).toBe(true);
      expect(isNavigationKey('.')).toBe(true);
      expect(isNavigationKey(',')).toBe(true);
      expect(isNavigationKey(' ')).toBe(true);
      expect(isNavigationKey('ArrowRight')).toBe(true);
      expect(isNavigationKey('ArrowLeft')).toBe(true);
      expect(isNavigationKey('Tab')).toBe(true);
    });

    it('should not identify regular keys as navigation', () => {
      expect(isNavigationKey('1')).toBe(false);
      expect(isNavigationKey('a')).toBe(false);
      expect(isNavigationKey('Enter')).toBe(false);
    });
  });

  describe('clearSegment', () => {
    it('should return empty state for segment', () => {
      expect(clearSegment()).toEqual({
        displayValue: '--',
        actualValue: null,
      });
    });
  });

  describe('commitSegmentValue', () => {
    it('should fill empty minutes with 00', () => {
      expect(commitSegmentValue(null, 'minutes')).toBe(0);
    });

    it('should preserve existing values', () => {
      expect(commitSegmentValue(15, 'hours')).toBe(15);
      expect(commitSegmentValue(30, 'minutes')).toBe(30);
    });

    it('should handle period values', () => {
      expect(commitSegmentValue('AM', 'period')).toBe('AM');
      expect(commitSegmentValue('PM', 'period')).toBe('PM');
    });
  });

  describe('coerceToValidRange', () => {
    it('should coerce hours to valid 24h range', () => {
      expect(coerceToValidRange(25, 'hours', false)).toBe(23);
      expect(coerceToValidRange(-1, 'hours', false)).toBe(0);
      expect(coerceToValidRange(15, 'hours', false)).toBe(15);
    });

    it('should coerce hours to valid 12h range', () => {
      expect(coerceToValidRange(0, 'hours', true)).toBe(1);
      expect(coerceToValidRange(13, 'hours', true)).toBe(12);
      expect(coerceToValidRange(6, 'hours', true)).toBe(6);
    });

    it('should coerce minutes to valid range', () => {
      expect(coerceToValidRange(60, 'minutes', false)).toBe(59);
      expect(coerceToValidRange(-1, 'minutes', false)).toBe(0);
      expect(coerceToValidRange(30, 'minutes', false)).toBe(30);
    });

    it('should coerce seconds to valid range', () => {
      expect(coerceToValidRange(60, 'seconds', false)).toBe(59);
      expect(coerceToValidRange(-1, 'seconds', false)).toBe(0);
      expect(coerceToValidRange(45, 'seconds', false)).toBe(45);
    });
  });

  describe('shouldAdvanceSegment', () => {
    it('should advance after complete hour input', () => {
      expect(shouldAdvanceSegment('hours', '12', false)).toBe(true);
      expect(shouldAdvanceSegment('hours', '09', false)).toBe(true);
    });

    it('should not advance after incomplete hour input', () => {
      expect(shouldAdvanceSegment('hours', '1', false)).toBe(false);
      expect(shouldAdvanceSegment('hours', '2', false)).toBe(false);
    });

    it('should not advance from minutes segment', () => {
      expect(shouldAdvanceSegment('minutes', '59', false)).toBe(false);
      expect(shouldAdvanceSegment('minutes', '00', false)).toBe(false);
    });

    it('should not advance from seconds segment', () => {
      expect(shouldAdvanceSegment('seconds', '59', false)).toBe(false);
    });
  });
});
