import React from 'react';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TimePicker } from 'src/app-components/TimePicker/TimePicker';
import type { TimePickerProps } from 'src/app-components/TimePicker/TimePicker';

describe('TimePicker - Auto-Advance Integration', () => {
  const defaultProps: TimePickerProps = {
    id: 'test-timepicker',
    value: '',
    onChange: jest.fn(),
    format: 'HH:mm',
    'aria-label': 'Time picker',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Focus Management - 24-Hour Format', () => {
    it('should advance from hours to minutes after complete input', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const hoursInput = inputs[0];
      const minutesInput = inputs[1];
      
      // Focus hours and type complete value
      await userEvent.click(hoursInput);
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '23');
      
      // Should auto-advance to minutes
      expect(minutesInput).toHaveFocus();
      expect(onChange).toHaveBeenCalledWith('23:00');
    });

    it('should advance from hours to minutes when first digit requires it', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const hoursInput = inputs[0];
      const minutesInput = inputs[1];
      
      // Type "3" which should auto-advance immediately
      await userEvent.click(hoursInput);
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '3');
      
      // Should auto-advance to minutes immediately
      expect(minutesInput).toHaveFocus();
      expect(onChange).toHaveBeenCalledWith('03:00');
    });

    it('should advance from minutes to next field after complete input', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          format="HH:mm:ss"
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const minutesInput = inputs[1];
      const secondsInput = inputs[2];
      
      // Focus minutes and type complete value
      await userEvent.click(minutesInput);
      await userEvent.clear(minutesInput);
      await userEvent.type(minutesInput, '45');
      
      // Should auto-advance to seconds
      expect(secondsInput).toHaveFocus();
    });
  });

  describe('Focus Management - 12-Hour Format', () => {
    it('should advance from hours to minutes in 12-hour format', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          format="hh:mm a"
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const hoursInput = inputs[0];
      const minutesInput = inputs[1];
      
      // Type "12" in 12-hour format
      await userEvent.click(hoursInput);
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '12');
      
      // Should auto-advance to minutes
      expect(minutesInput).toHaveFocus();
    });

    it('should advance from minutes to period in 12-hour format', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          format="hh:mm a"
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const minutesInput = inputs[1];
      const periodInput = inputs[2];
      
      // Focus minutes and type complete value
      await userEvent.click(minutesInput);
      await userEvent.clear(minutesInput);
      await userEvent.type(minutesInput, '30');
      
      // Should auto-advance to period
      expect(periodInput).toHaveFocus();
    });

    it('should advance from seconds to period when format includes seconds', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          format="hh:mm:ss a"
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const secondsInput = inputs[2];
      const periodInput = inputs[3];
      
      // Focus seconds and type complete value
      await userEvent.click(secondsInput);
      await userEvent.clear(secondsInput);
      await userEvent.type(secondsInput, '45');
      
      // Should auto-advance to period
      expect(periodInput).toHaveFocus();
    });
  });

  describe('End-of-Field Behavior', () => {
    it('should not auto-advance beyond last field in 24-hour format', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          format="HH:mm"
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const minutesInput = inputs[1];
      
      // Focus minutes (last field) and type complete value
      await userEvent.click(minutesInput);
      await userEvent.clear(minutesInput);
      await userEvent.type(minutesInput, '45');
      
      // Should stay focused on minutes (no next field)
      expect(minutesInput).toHaveFocus();
    });

    it('should not auto-advance beyond period in 12-hour format', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          format="hh:mm a"
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const periodInput = inputs[2];
      
      // Focus period and change value
      await userEvent.click(periodInput);
      await userEvent.clear(periodInput);
      await userEvent.type(periodInput, 'PM');
      
      // Should stay focused on period (last field)
      expect(periodInput).toHaveFocus();
    });
  });

  describe('Progressive Typing Integration', () => {
    it('should maintain time consistency during auto-advance', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          format="HH:mm:ss"
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const hoursInput = inputs[0];
      const minutesInput = inputs[1];
      const secondsInput = inputs[2];
      
      // Type hours and verify auto-advance
      await userEvent.click(hoursInput);
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '14');
      expect(minutesInput).toHaveFocus();
      
      // Type minutes and verify auto-advance
      await userEvent.type(minutesInput, '30');
      expect(secondsInput).toHaveFocus();
      
      // Type seconds
      await userEvent.type(secondsInput, '45');
      
      // Final value should be correctly formatted
      expect(onChange).toHaveBeenLastCalledWith('14:30:45');
    });

    it('should handle constraint capping during auto-advance', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          format="HH:mm"
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const hoursInput = inputs[0];
      const minutesInput = inputs[1];
      
      // Type "2" then "9" - should cap to "23" and auto-advance
      await userEvent.click(hoursInput);
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '2');
      await userEvent.type(hoursInput, '9');
      
      // Should auto-advance to minutes with capped value
      expect(minutesInput).toHaveFocus();
      expect(onChange).toHaveBeenCalledWith('23:00');
    });

    it('should handle backspace without unwanted auto-advance', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          format="HH:mm"
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const hoursInput = inputs[0];
      const minutesInput = inputs[1];
      
      // Type "23" to trigger auto-advance
      await userEvent.click(hoursInput);
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '23');
      expect(minutesInput).toHaveFocus();
      
      // Navigate back to hours and backspace
      await userEvent.click(hoursInput);
      await userEvent.keyboard('{Backspace}');
      
      // Should not auto-advance after backspace
      expect(hoursInput).toHaveFocus();
    });
  });

  describe('Constraint Handling', () => {
    it('should respect minTime constraints during auto-advance', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          format="HH:mm"
          minTime="14:30"
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const hoursInput = inputs[0];
      const minutesInput = inputs[1];
      
      // Try to type "13" which is below minTime
      await userEvent.click(hoursInput);
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '13');
      
      // Should not auto-advance with invalid time
      expect(hoursInput).toHaveFocus();
      
      // Type valid hour
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '15');
      
      // Should auto-advance with valid time
      expect(minutesInput).toHaveFocus();
    });

    it('should respect maxTime constraints during auto-advance', async () => {
      const onChange = jest.fn();
      
      render(
        <TimePicker
          {...defaultProps}
          format="HH:mm"
          maxTime="16:30"
          onChange={onChange}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      const hoursInput = inputs[0];
      const minutesInput = inputs[1];
      
      // Try to type "17" which is above maxTime
      await userEvent.click(hoursInput);
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '17');
      
      // Should not auto-advance with invalid time
      expect(hoursInput).toHaveFocus();
      
      // Type valid hour
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, '15');
      
      // Should auto-advance with valid time
      expect(minutesInput).toHaveFocus();
    });
  });
});