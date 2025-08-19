import {
  getValidRange,
  canAcceptSecondDigit,
  getMaxValidValue,
  shouldAutoAdvance,
  buildProgressiveValue,
  getSmartInputResult,
} from './smartInputUtils';
import type { SegmentType, TimeFormat } from './TimePicker';

describe('Smart Input Utilities', () => {
  describe('getValidRange', () => {
    it('should return correct range for 24-hour hours', () => {
      const range = getValidRange('hours', 'HH:mm');
      expect(range).toEqual([0, 23]);
    });

    it('should return correct range for 12-hour hours', () => {
      const range = getValidRange('hours', 'hh:mm a');
      expect(range).toEqual([1, 12]);
    });

    it('should return correct range for minutes', () => {
      const range = getValidRange('minutes', 'HH:mm');
      expect(range).toEqual([0, 59]);
    });

    it('should return correct range for seconds', () => {
      const range = getValidRange('seconds', 'HH:mm:ss');
      expect(range).toEqual([0, 59]);
    });
  });

  describe('canAcceptSecondDigit', () => {
    describe('24-hour hours (0-23)', () => {
      it('should allow second digit for first digit 0', () => {
        expect(canAcceptSecondDigit('0', 'hours', 'HH:mm')).toBe(true); // 00-09
      });

      it('should allow second digit for first digit 1', () => {
        expect(canAcceptSecondDigit('1', 'hours', 'HH:mm')).toBe(true); // 10-19
      });

      it('should allow limited second digit for first digit 2', () => {
        expect(canAcceptSecondDigit('2', 'hours', 'HH:mm')).toBe(true); // 20-23
      });

      it('should not allow second digit for first digit 3-9', () => {
        expect(canAcceptSecondDigit('3', 'hours', 'HH:mm')).toBe(false); // 30+ > 23
        expect(canAcceptSecondDigit('9', 'hours', 'HH:mm')).toBe(false); // 90+ > 23
      });
    });

    describe('12-hour hours (1-12)', () => {
      it('should allow second digit for first digit 1', () => {
        expect(canAcceptSecondDigit('1', 'hours', 'hh:mm a')).toBe(true); // 10-12
      });

      it('should not allow second digit for first digit 2-9', () => {
        expect(canAcceptSecondDigit('2', 'hours', 'hh:mm a')).toBe(false); // 20+ > 12
        expect(canAcceptSecondDigit('9', 'hours', 'hh:mm a')).toBe(false); // 90+ > 12
      });
    });

    describe('minutes/seconds (0-59)', () => {
      it('should allow second digit for first digit 0-5', () => {
        expect(canAcceptSecondDigit('0', 'minutes', 'HH:mm')).toBe(true); // 00-09
        expect(canAcceptSecondDigit('5', 'minutes', 'HH:mm')).toBe(true); // 50-59
      });

      it('should not allow second digit for first digit 6-9', () => {
        expect(canAcceptSecondDigit('6', 'minutes', 'HH:mm')).toBe(false); // 60+ > 59
        expect(canAcceptSecondDigit('9', 'seconds', 'HH:mm:ss')).toBe(false); // 90+ > 59
      });
    });
  });

  describe('getMaxValidValue', () => {
    describe('24-hour hours', () => {
      it('should return correct max for first digit 0', () => {
        expect(getMaxValidValue('0', 'hours', 'HH:mm')).toBe(9); // 09
      });

      it('should return correct max for first digit 1', () => {
        expect(getMaxValidValue('1', 'hours', 'HH:mm')).toBe(19); // 19
      });

      it('should return correct max for first digit 2', () => {
        expect(getMaxValidValue('2', 'hours', 'HH:mm')).toBe(23); // 23
      });

      it('should return single digit for impossible combinations', () => {
        expect(getMaxValidValue('3', 'hours', 'HH:mm')).toBe(3); // 03
      });
    });

    describe('12-hour hours', () => {
      it('should return correct max for first digit 1', () => {
        expect(getMaxValidValue('1', 'hours', 'hh:mm a')).toBe(12); // 12
      });

      it('should return single digit for other digits', () => {
        expect(getMaxValidValue('2', 'hours', 'hh:mm a')).toBe(2); // 02
        expect(getMaxValidValue('9', 'hours', 'hh:mm a')).toBe(9); // 09
      });
    });

    describe('minutes/seconds', () => {
      it('should return correct max for valid first digits', () => {
        expect(getMaxValidValue('0', 'minutes', 'HH:mm')).toBe(9); // 09
        expect(getMaxValidValue('3', 'minutes', 'HH:mm')).toBe(39); // 39
        expect(getMaxValidValue('5', 'seconds', 'HH:mm:ss')).toBe(59); // 59
      });

      it('should return single digit for impossible combinations', () => {
        expect(getMaxValidValue('6', 'minutes', 'HH:mm')).toBe(6); // 06
        expect(getMaxValidValue('9', 'seconds', 'HH:mm:ss')).toBe(9); // 09
      });
    });
  });

  describe('shouldAutoAdvance', () => {
    it('should auto-advance when first digit cannot accept second digit', () => {
      expect(shouldAutoAdvance('3', 'hours', 'HH:mm')).toBe(true);
      expect(shouldAutoAdvance('2', 'hours', 'hh:mm a')).toBe(true);
      expect(shouldAutoAdvance('7', 'minutes', 'HH:mm')).toBe(true);
    });

    it('should not auto-advance when first digit can accept second digit', () => {
      expect(shouldAutoAdvance('2', 'hours', 'HH:mm')).toBe(false);
      expect(shouldAutoAdvance('1', 'hours', 'hh:mm a')).toBe(false);
      expect(shouldAutoAdvance('4', 'minutes', 'HH:mm')).toBe(false);
    });
  });

  describe('buildProgressiveValue', () => {
    it('should build two-digit values correctly', () => {
      expect(buildProgressiveValue('2', '3', 'hours', 'HH:mm')).toBe(23);
      expect(buildProgressiveValue('1', '5', 'minutes', 'HH:mm')).toBe(15);
    });

    it('should cap values that exceed maximum', () => {
      expect(buildProgressiveValue('2', '9', 'hours', 'HH:mm')).toBe(23);
      expect(buildProgressiveValue('1', '9', 'hours', 'hh:mm a')).toBe(12);
      expect(buildProgressiveValue('6', '7', 'minutes', 'HH:mm')).toBe(59);
    });

    it('should handle valid two-digit combinations', () => {
      expect(buildProgressiveValue('1', '2', 'hours', 'hh:mm a')).toBe(12);
      expect(buildProgressiveValue('0', '5', 'minutes', 'HH:mm')).toBe(5);
      expect(buildProgressiveValue('4', '5', 'seconds', 'HH:mm:ss')).toBe(45);
    });
  });

  describe('getSmartInputResult', () => {
    describe('first digit input', () => {
      it('should format single digit and determine auto-advance', () => {
        const result = getSmartInputResult('2', '', 'hours', 'HH:mm');
        expect(result).toEqual({
          displayValue: '02',
          actualValue: 2,
          shouldAutoAdvance: false,
          isBuilding: true,
        });
      });

      it('should auto-advance for impossible first digits', () => {
        const result = getSmartInputResult('3', '', 'hours', 'HH:mm');
        expect(result).toEqual({
          displayValue: '03',
          actualValue: 3,
          shouldAutoAdvance: true,
          isBuilding: false,
        });
      });
    });

    describe('second digit input', () => {
      it('should complete valid two-digit values', () => {
        const result = getSmartInputResult('3', '2', 'hours', 'HH:mm');
        expect(result).toEqual({
          displayValue: '23',
          actualValue: 23,
          shouldAutoAdvance: true,
          isBuilding: false,
        });
      });

      it('should cap invalid two-digit values', () => {
        const result = getSmartInputResult('9', '2', 'hours', 'HH:mm');
        expect(result).toEqual({
          displayValue: '23',
          actualValue: 23,
          shouldAutoAdvance: true,
          isBuilding: false,
        });
      });

      it('should handle valid combinations in 12-hour format', () => {
        const result = getSmartInputResult('2', '1', 'hours', 'hh:mm a');
        expect(result).toEqual({
          displayValue: '12',
          actualValue: 12,
          shouldAutoAdvance: true,
          isBuilding: false,
        });
      });
    });

    describe('constraints', () => {
      it('should respect minimum constraints', () => {
        const result = getSmartInputResult('5', '', 'hours', 'HH:mm', 10, 20);
        expect(result).toEqual({
          displayValue: '10', // Capped to minimum
          actualValue: 10,
          shouldAutoAdvance: true,
          isBuilding: false,
        });
      });

      it('should respect maximum constraints', () => {
        const result = getSmartInputResult('9', '1', 'hours', 'HH:mm', 0, 15);
        expect(result).toEqual({
          displayValue: '15', // Capped to maximum
          actualValue: 15,
          shouldAutoAdvance: true,
          isBuilding: false,
        });
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      const result = getSmartInputResult('', '', 'hours', 'HH:mm');
      expect(result).toEqual({
        displayValue: '',
        actualValue: 0,
        shouldAutoAdvance: false,
        isBuilding: false,
      });
    });

    it('should handle non-numeric input', () => {
      const result = getSmartInputResult('a', '', 'hours', 'HH:mm');
      expect(result).toEqual({
        displayValue: '',
        actualValue: 0,
        shouldAutoAdvance: false,
        isBuilding: false,
      });
    });

    it('should handle period input', () => {
      const result = getSmartInputResult('A', '', 'period', 'hh:mm a');
      expect(result).toEqual({
        displayValue: 'A',
        actualValue: 'A',
        shouldAutoAdvance: false,
        isBuilding: true,
      });
    });
  });
});