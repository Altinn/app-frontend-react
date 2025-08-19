import React from 'react';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TimeSegment } from 'src/app-components/TimePicker/TimeSegment';
import type { TimeSegmentProps } from 'src/app-components/TimePicker/TimeSegment';

describe('TimeSegment Component', () => {
  const defaultProps: TimeSegmentProps = {
    value: 12,
    min: 1,
    max: 12,
    type: 'hours',
    format: 'hh:mm a',
    onValueChange: jest.fn(),
    onNavigate: jest.fn(),
    'aria-label': 'Hours',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with formatted value', () => {
      render(
        <TimeSegment
          {...defaultProps}
          value={9}
        />,
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('09');
    });

    it('should render period segment with AM/PM', () => {
      render(
        <TimeSegment
          {...defaultProps}
          type='period'
          value='AM'
        />,
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('AM');
    });

    it('should render with placeholder', () => {
      render(
        <TimeSegment
          {...defaultProps}
          placeholder='HH'
        />,
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'HH');
    });

    it('should render as disabled when disabled prop is true', () => {
      render(
        <TimeSegment
          {...defaultProps}
          disabled
        />,
      );
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should render as readonly when readOnly prop is true', () => {
      render(
        <TimeSegment
          {...defaultProps}
          readOnly
        />,
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('User Input', () => {
    it('should accept valid numeric input with smart formatting', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      render(
        <TimeSegment
          {...defaultProps}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />,
      );
      const input = screen.getByRole('textbox');

      await userEvent.clear(input);
      await userEvent.type(input, '8');

      // Should format to "08" and auto-advance (no valid 8X in 1-12 range for 12-hour)
      expect(input).toHaveValue('08');
      expect(onValueChange).toHaveBeenCalledWith(8);
      expect(onAutoAdvance).toHaveBeenCalled(); // Should auto-advance since no valid 8X
    });

    it('should build progressive two-digit input', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      render(
        <TimeSegment
          {...defaultProps}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />,
      );
      const input = screen.getByRole('textbox');

      await userEvent.clear(input);
      await userEvent.type(input, '1'); // First digit
      
      // Should show formatted but not auto-advance (can build 10-12 in 12-hour)
      expect(input).toHaveValue('01');
      expect(onValueChange).toHaveBeenCalledWith(1);
      expect(onAutoAdvance).not.toHaveBeenCalled();

      await userEvent.type(input, '1'); // Second digit

      // Should complete to "11" and auto-advance
      expect(input).toHaveValue('11');
      expect(onValueChange).toHaveBeenCalledWith(11);
      expect(onAutoAdvance).toHaveBeenCalled();
    });

    it('should reject invalid input', async () => {
      const onValueChange = jest.fn();
      render(
        <TimeSegment
          {...defaultProps}
          onValueChange={onValueChange}
          value={12}
        />,
      );
      const input = screen.getByRole('textbox');

      await userEvent.clear(input);
      await userEvent.type(input, 'abc');

      expect(input).toHaveValue(''); // Should clear on invalid input
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('should accept period input', async () => {
      const onValueChange = jest.fn();
      render(
        <TimeSegment
          {...defaultProps}
          type='period'
          value='AM'
          onValueChange={onValueChange}
        />,
      );
      const input = screen.getByRole('textbox');

      await userEvent.clear(input);
      await userEvent.type(input, 'PM');

      expect(onValueChange).toHaveBeenCalledWith('PM');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should call onNavigate with right on ArrowRight', async () => {
      const onNavigate = jest.fn();
      render(
        <TimeSegment
          {...defaultProps}
          onNavigate={onNavigate}
        />,
      );
      const input = screen.getByRole('textbox');

      await userEvent.click(input);
      await userEvent.keyboard('{ArrowRight}');

      expect(onNavigate).toHaveBeenCalledWith('right');
    });

    it('should call onNavigate with left on ArrowLeft', async () => {
      const onNavigate = jest.fn();
      render(
        <TimeSegment
          {...defaultProps}
          onNavigate={onNavigate}
        />,
      );
      const input = screen.getByRole('textbox');

      await userEvent.click(input);
      await userEvent.keyboard('{ArrowLeft}');

      expect(onNavigate).toHaveBeenCalledWith('left');
    });

    it('should increment value on ArrowUp', async () => {
      const onValueChange = jest.fn();
      render(
        <TimeSegment
          {...defaultProps}
          value={8}
          onValueChange={onValueChange}
        />,
      );
      const input = screen.getByRole('textbox');

      await userEvent.click(input);
      await userEvent.keyboard('{ArrowUp}');

      expect(onValueChange).toHaveBeenCalledWith(9);
    });

    it('should decrement value on ArrowDown', async () => {
      const onValueChange = jest.fn();
      render(
        <TimeSegment
          {...defaultProps}
          value={8}
          onValueChange={onValueChange}
        />,
      );
      const input = screen.getByRole('textbox');

      await userEvent.click(input);
      await userEvent.keyboard('{ArrowDown}');

      expect(onValueChange).toHaveBeenCalledWith(7);
    });

    it('should toggle period on ArrowUp/Down', async () => {
      const onValueChange = jest.fn();
      render(
        <TimeSegment
          {...defaultProps}
          type='period'
          value='AM'
          onValueChange={onValueChange}
        />,
      );
      const input = screen.getByRole('textbox');

      await userEvent.click(input);
      await userEvent.keyboard('{ArrowUp}');
      expect(onValueChange).toHaveBeenCalledWith('PM');

      jest.clearAllMocks();

      // Simulate component with PM value for ArrowDown test
      render(
        <TimeSegment
          {...defaultProps}
          type='period'
          value='PM'
          onValueChange={onValueChange}
        />,
      );
      const pmInput = screen.getAllByRole('textbox')[1]; // Get the second input (PM one)

      await userEvent.click(pmInput);
      await userEvent.keyboard('{ArrowDown}');
      expect(onValueChange).toHaveBeenCalledWith('AM');
    });
  });

  describe('Focus Behavior', () => {
    it('should select all text on focus', async () => {
      const onFocus = jest.fn();
      render(
        <TimeSegment
          {...defaultProps}
          value={12}
          onFocus={onFocus}
        />,
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;

      await userEvent.click(input);

      expect(onFocus).toHaveBeenCalled();
      // Note: Testing text selection is limited in jsdom
    });

    it('should auto-pad single digit on blur', async () => {
      const onValueChange = jest.fn();
      const { rerender } = render(
        <TimeSegment
          {...defaultProps}
          value={3}
          onValueChange={onValueChange}
        />,
      );
      const input = screen.getByRole('textbox');

      await userEvent.clear(input);
      await userEvent.type(input, '3');
      await userEvent.tab(); // Trigger blur

      expect(onValueChange).toHaveBeenCalledWith(3);

      // Rerender with new value to check formatting
      rerender(
        <TimeSegment
          {...defaultProps}
          value={3}
          onValueChange={onValueChange}
        />,
      );
      expect(input).toHaveValue('03');
    });

    it('should call onBlur when focus is lost', async () => {
      const onBlur = jest.fn();
      render(
        <div>
          <TimeSegment
            {...defaultProps}
            onBlur={onBlur}
          />
          <button>Other element</button>
        </div>,
      );
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await userEvent.click(input);
      await userEvent.click(button);

      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Value Synchronization', () => {
    it('should update display when value prop changes', () => {
      const { rerender } = render(
        <TimeSegment
          {...defaultProps}
          value={8}
        />,
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('08');

      rerender(
        <TimeSegment
          {...defaultProps}
          value={12}
        />,
      );
      expect(input).toHaveValue('12');
    });

    it('should build 23 progressively with smart input', async () => {
      const onValueChange = jest.fn();
      const onAutoAdvance = jest.fn();
      render(
        <TimeSegment
          {...defaultProps}
          format='HH:mm'
          type='hours'
          min={0}
          max={23}
          value={0}
          onValueChange={onValueChange}
          onAutoAdvance={onAutoAdvance}
        />,
      );
      const input = screen.getByRole('textbox');

      // Clear and type "2"
      await userEvent.clear(input);
      await userEvent.type(input, '2');
      
      // Should show "02" and wait for next digit
      expect(input).toHaveValue('02');
      expect(onValueChange).toHaveBeenCalledWith(2);
      expect(onAutoAdvance).not.toHaveBeenCalled();

      // Type "3" to complete "23"
      await userEvent.type(input, '3');

      // Should show "23" and auto-advance
      expect(input).toHaveValue('23');
      expect(onValueChange).toHaveBeenCalledWith(23);
      expect(onAutoAdvance).toHaveBeenCalled();
    });

    it('should format value based on segment type', () => {
      render(
        <TimeSegment
          {...defaultProps}
          type='minutes'
          value={5}
        />,
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('05');
    });

    it('should handle 24-hour format', () => {
      render(
        <TimeSegment
          {...defaultProps}
          format='HH:mm'
          type='hours'
          value={14}
        />,
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('14');
    });
  });
});
