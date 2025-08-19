import React from 'react';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TimeSegment } from 'src/app-components/TimePicker/TimeSegment';
import type { TimeSegmentProps } from 'src/app-components/TimePicker/TimeSegment';

describe('TimeSegment - Smart Input Behavior', () => {
  const defaultProps: TimeSegmentProps = {
    value: 0,
    min: 0,
    max: 23,
    type: 'hours',
    format: 'HH:mm',
    onValueChange: jest.fn(),
    onNavigate: jest.fn(),
    'aria-label': 'Hours',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Progressive Typing - 24-Hour Hours (0-23)', () => {
    it('should build 23 from typing 2 then 3', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      
      render(
        <TimeSegment
          {...defaultProps}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      // Clear and type "2"
      await userEvent.clear(input);
      await userEvent.type(input, '2');
      
      // Should show "02" but be in building state
      expect(input).toHaveValue('02');
      expect(onValueChange).toHaveBeenCalledWith(2);
      expect(onAutoAdvance).not.toHaveBeenCalled();
      
      // Type "3" to complete "23"
      await userEvent.type(input, '3');
      
      // Should complete to "23" and auto-advance
      expect(input).toHaveValue('23');
      expect(onValueChange).toHaveBeenCalledWith(23);
      expect(onAutoAdvance).toHaveBeenCalled();
    });

    it('should cap 29 to 23 when typing 2 then 9', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      
      render(
        <TimeSegment
          {...defaultProps}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.clear(input);
      await userEvent.type(input, '2');
      await userEvent.type(input, '9');
      
      // Should cap to max valid value starting with "2"
      expect(input).toHaveValue('23');
      expect(onValueChange).toHaveBeenCalledWith(23);
      expect(onAutoAdvance).toHaveBeenCalled();
    });

    it('should auto-advance immediately after typing 3 (no valid second digit)', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      
      render(
        <TimeSegment
          {...defaultProps}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.clear(input);
      await userEvent.type(input, '3');
      
      // Should show "03" and auto-advance immediately (no valid 3X > 23)
      expect(input).toHaveValue('03');
      expect(onValueChange).toHaveBeenCalledWith(3);
      expect(onAutoAdvance).toHaveBeenCalled();
    });

    it('should handle typing 0 then continue building', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      
      render(
        <TimeSegment
          {...defaultProps}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.clear(input);
      await userEvent.type(input, '0');
      
      // Should show "00" but not auto-advance (can build 00-09)
      expect(input).toHaveValue('00');
      expect(onValueChange).toHaveBeenCalledWith(0);
      expect(onAutoAdvance).not.toHaveBeenCalled();
      
      await userEvent.type(input, '5');
      
      // Should complete to "05" and auto-advance
      expect(input).toHaveValue('05');
      expect(onValueChange).toHaveBeenCalledWith(5);
      expect(onAutoAdvance).toHaveBeenCalled();
    });
  });

  describe('Progressive Typing - 12-Hour Hours (1-12)', () => {
    const props12Hour = {
      ...defaultProps,
      min: 1,
      max: 12,
      format: 'hh:mm a' as const,
    };

    it('should build 12 from typing 1 then 2', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      
      render(
        <TimeSegment
          {...props12Hour}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.clear(input);
      await userEvent.type(input, '1');
      await userEvent.type(input, '2');
      
      expect(input).toHaveValue('12');
      expect(onValueChange).toHaveBeenCalledWith(12);
      expect(onAutoAdvance).toHaveBeenCalled();
    });

    it('should cap 19 to 12 when typing 1 then 9', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      
      render(
        <TimeSegment
          {...props12Hour}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.clear(input);
      await userEvent.type(input, '1');
      await userEvent.type(input, '9');
      
      // Should cap to 12 (max valid starting with "1")
      expect(input).toHaveValue('12');
      expect(onValueChange).toHaveBeenCalledWith(12);
      expect(onAutoAdvance).toHaveBeenCalled();
    });

    it('should auto-advance immediately after typing 2-9', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      
      render(
        <TimeSegment
          {...props12Hour}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.clear(input);
      await userEvent.type(input, '5');
      
      // Should auto-advance immediately (no valid 5X in 1-12 range)
      expect(input).toHaveValue('05');
      expect(onValueChange).toHaveBeenCalledWith(5);
      expect(onAutoAdvance).toHaveBeenCalled();
    });
  });

  describe('Progressive Typing - Minutes/Seconds (0-59)', () => {
    const propsMinutes = {
      ...defaultProps,
      type: 'minutes' as const,
      max: 59,
    };

    it('should build 59 from typing 5 then 9', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      
      render(
        <TimeSegment
          {...propsMinutes}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.clear(input);
      await userEvent.type(input, '5');
      await userEvent.type(input, '9');
      
      expect(input).toHaveValue('59');
      expect(onValueChange).toHaveBeenCalledWith(59);
      expect(onAutoAdvance).toHaveBeenCalled();
    });

    it('should cap 67 to 59 when typing 6 then 7', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      
      render(
        <TimeSegment
          {...propsMinutes}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.clear(input);
      await userEvent.type(input, '6');
      await userEvent.type(input, '7');
      
      // Should cap to 59 (max valid starting with "6")
      expect(input).toHaveValue('59');
      expect(onValueChange).toHaveBeenCalledWith(59);
      expect(onAutoAdvance).toHaveBeenCalled();
    });

    it('should auto-advance immediately after typing 6-9', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      
      render(
        <TimeSegment
          {...propsMinutes}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.clear(input);
      await userEvent.type(input, '7');
      
      // Should auto-advance immediately (no valid 7X in 0-59 range)
      expect(input).toHaveValue('07');
      expect(onValueChange).toHaveBeenCalledWith(7);
      expect(onAutoAdvance).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle backspace during building state', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      
      render(
        <TimeSegment
          {...defaultProps}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      // Type "2" to start building
      await userEvent.clear(input);
      await userEvent.type(input, '2');
      expect(input).toHaveValue('02');
      
      // Backspace should return to empty/reset state
      await userEvent.keyboard('{Backspace}');
      expect(input).toHaveValue('');
      expect(onAutoAdvance).not.toHaveBeenCalled();
    });

    it('should handle paste of invalid values', async () => {
      const onValueChange = jest.fn();
      
      render(
        <TimeSegment
          {...defaultProps}
          onValueChange={onValueChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      // Paste invalid value
      await userEvent.clear(input);
      await userEvent.click(input);
      await userEvent.paste('25'); // Invalid for 24-hour format
      
      // Should cap to maximum valid (23)
      expect(onValueChange).toHaveBeenCalledWith(23);
    });

    it('should not interrupt typing when external value changes', async () => {
      const onValueChange = jest.fn();
      const { rerender } = render(
        <TimeSegment
          {...defaultProps}
          value={0}
          onValueChange={onValueChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      // Start typing
      await userEvent.clear(input);
      await userEvent.type(input, '1');
      expect(input).toHaveValue('01');
      
      // External value change shouldn't interrupt typing
      rerender(
        <TimeSegment
          {...defaultProps}
          value={5} // External change
          onValueChange={onValueChange}
        />
      );
      
      // Should still show typed value, not external value
      expect(input).toHaveValue('01');
      
      // Continue typing
      await userEvent.type(input, '8');
      expect(input).toHaveValue('18');
    });

    it('should respect constraints during building', async () => {
      const onValueChange = jest.fn();
      
      render(
        <TimeSegment
          {...defaultProps}
          min={10}
          max={15}
          onValueChange={onValueChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      // Type "0" - should be rejected due to min constraint
      await userEvent.clear(input);
      await userEvent.type(input, '0');
      
      // Should not accept value below min
      expect(onValueChange).not.toHaveBeenCalledWith(0);
      
      // Type "1" - should be accepted and allow building
      await userEvent.type(input, '1');
      expect(input).toHaveValue('01');
      
      // Type "2" to make "12" - should be valid
      await userEvent.type(input, '2');
      expect(input).toHaveValue('12');
      expect(onValueChange).toHaveBeenCalledWith(12);
    });
  });
});