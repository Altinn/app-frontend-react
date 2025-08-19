import {
  getDropdownColumns,
  getInitialFocusedOption,
  getNextOption,
  getNextColumn,
  handleDropdownKeyDown,
} from './dropdownNavigation';
import type { TimeFormat } from './TimePicker';
import type { TimeValue } from './timeConstraintUtils';

interface DropdownState {
  focusedColumn: number;
  focusedOption: number;
  isOpen: boolean;
}

interface DropdownColumn {
  type: 'hours' | 'minutes' | 'seconds' | 'period';
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  selectedValue: string | number;
}

describe('Dropdown Navigation Logic', () => {
  const mockTimeValue: TimeValue = {
    hours: 14,
    minutes: 30,
    seconds: 45,
    period: 'PM',
  };

  describe('getDropdownColumns', () => {
    it('should return correct columns for 24-hour format without seconds', () => {
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      expect(columns).toHaveLength(2);
      expect(columns[0].type).toBe('hours');
      expect(columns[1].type).toBe('minutes');
    });

    it('should return correct columns for 24-hour format with seconds', () => {
      const columns = getDropdownColumns('HH:mm:ss', mockTimeValue);
      expect(columns).toHaveLength(3);
      expect(columns[0].type).toBe('hours');
      expect(columns[1].type).toBe('minutes');
      expect(columns[2].type).toBe('seconds');
    });

    it('should return correct columns for 12-hour format', () => {
      const columns = getDropdownColumns('hh:mm a', mockTimeValue);
      expect(columns).toHaveLength(3);
      expect(columns[0].type).toBe('hours');
      expect(columns[1].type).toBe('minutes');
      expect(columns[2].type).toBe('period');
    });

    it('should return correct columns for 12-hour format with seconds', () => {
      const columns = getDropdownColumns('hh:mm:ss a', mockTimeValue);
      expect(columns).toHaveLength(4);
      expect(columns[0].type).toBe('hours');
      expect(columns[1].type).toBe('minutes');
      expect(columns[2].type).toBe('seconds');
      expect(columns[3].type).toBe('period');
    });

    it('should mark current values as selected', () => {
      const columns = getDropdownColumns('hh:mm a', mockTimeValue);
      expect(columns[0].selectedValue).toBe(2); // 14:30 PM = 2:30 PM display
      expect(columns[1].selectedValue).toBe(30);
      expect(columns[2].selectedValue).toBe('PM');
    });
  });

  describe('getInitialFocusedOption', () => {
    it('should return index of currently selected value', () => {
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const focusedHour = getInitialFocusedOption(columns[0]);
      const focusedMinute = getInitialFocusedOption(columns[1]);
      
      expect(focusedHour).toBe(14); // Index of hour 14 in 24h format
      expect(focusedMinute).toBe(30); // Index of minute 30
    });

    it('should handle 12-hour format correctly', () => {
      const columns = getDropdownColumns('hh:mm a', mockTimeValue);
      const focusedHour = getInitialFocusedOption(columns[0]);
      const focusedPeriod = getInitialFocusedOption(columns[2]);
      
      expect(focusedHour).toBe(1); // Index 1 for hour "02" in 12h format (1-12)
      expect(focusedPeriod).toBe(1); // Index 1 for "PM" (0=AM, 1=PM)
    });
  });

  describe('getNextOption', () => {
    it('should increment option index', () => {
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const nextIndex = getNextOption(10, 'down', columns[0]);
      expect(nextIndex).toBe(11);
    });

    it('should decrement option index', () => {
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const nextIndex = getNextOption(10, 'up', columns[0]);
      expect(nextIndex).toBe(9);
    });

    it('should wrap to end when going up from first option', () => {
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const nextIndex = getNextOption(0, 'up', columns[0]);
      expect(nextIndex).toBe(23); // Last hour in 24h format
    });

    it('should wrap to beginning when going down from last option', () => {
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const nextIndex = getNextOption(23, 'down', columns[0]);
      expect(nextIndex).toBe(0); // First hour in 24h format
    });

    it('should skip disabled options', () => {
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      // Mock some disabled options
      columns[0].options[11].disabled = true;
      columns[0].options[12].disabled = true;
      
      const nextIndex = getNextOption(10, 'down', columns[0]);
      expect(nextIndex).toBe(13); // Skip disabled 11, 12
    });
  });

  describe('getNextColumn', () => {
    it('should move to next column', () => {
      const columns = getDropdownColumns('hh:mm:ss a', mockTimeValue);
      const nextColumn = getNextColumn(1, 'right', columns.length);
      expect(nextColumn).toBe(2); // minutes -> seconds
    });

    it('should move to previous column', () => {
      const columns = getDropdownColumns('hh:mm:ss a', mockTimeValue);
      const nextColumn = getNextColumn(2, 'left', columns.length);
      expect(nextColumn).toBe(1); // seconds -> minutes
    });

    it('should wrap to first column when going right from last', () => {
      const columns = getDropdownColumns('hh:mm a', mockTimeValue);
      const nextColumn = getNextColumn(2, 'right', columns.length);
      expect(nextColumn).toBe(0); // period -> hours
    });

    it('should wrap to last column when going left from first', () => {
      const columns = getDropdownColumns('hh:mm a', mockTimeValue);
      const nextColumn = getNextColumn(0, 'left', columns.length);
      expect(nextColumn).toBe(2); // hours -> period
    });
  });

  describe('handleDropdownKeyDown', () => {
    const initialState: DropdownState = {
      focusedColumn: 0,
      focusedOption: 14,
      isOpen: true,
    };

    it('should handle ArrowDown', () => {
      const mockEvent = { key: 'ArrowDown', preventDefault: jest.fn() };
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const result = handleDropdownKeyDown(mockEvent, initialState, columns);
      
      expect(result.shouldNavigate).toBe(true);
      expect(result.direction).toBe('down');
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle ArrowUp', () => {
      const mockEvent = { key: 'ArrowUp', preventDefault: jest.fn() };
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const result = handleDropdownKeyDown(mockEvent, initialState, columns);
      
      expect(result.shouldNavigate).toBe(true);
      expect(result.direction).toBe('up');
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle ArrowRight', () => {
      const mockEvent = { key: 'ArrowRight', preventDefault: jest.fn() };
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const result = handleDropdownKeyDown(mockEvent, initialState, columns);
      
      expect(result.shouldSwitchColumn).toBe(true);
      expect(result.columnDirection).toBe('right');
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle ArrowLeft', () => {
      const mockEvent = { key: 'ArrowLeft', preventDefault: jest.fn() };
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const result = handleDropdownKeyDown(mockEvent, initialState, columns);
      
      expect(result.shouldSwitchColumn).toBe(true);
      expect(result.columnDirection).toBe('left');
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle Enter', () => {
      const mockEvent = { key: 'Enter', preventDefault: jest.fn() };
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const result = handleDropdownKeyDown(mockEvent, initialState, columns);
      
      expect(result.shouldSelect).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle Escape', () => {
      const mockEvent = { key: 'Escape', preventDefault: jest.fn() };
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const result = handleDropdownKeyDown(mockEvent, initialState, columns);
      
      expect(result.shouldClose).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should not handle other keys', () => {
      const mockEvent = { key: 'Tab', preventDefault: jest.fn() };
      const columns = getDropdownColumns('HH:mm', mockTimeValue);
      const result = handleDropdownKeyDown(mockEvent, initialState, columns);
      
      expect(result.shouldNavigate).toBe(false);
      expect(result.shouldSwitchColumn).toBe(false);
      expect(result.shouldSelect).toBe(false);
      expect(result.shouldClose).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });
});