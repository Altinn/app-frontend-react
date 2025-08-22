import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { TimePicker } from 'src/app-components/TimePicker/TimePicker';

describe('TimePicker Dropdown Keyboard Navigation', () => {
  const defaultProps = {
    id: 'test-timepicker',
    value: '14:30',
    onChange: jest.fn(),
    'aria-label': 'Select time',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  const openDropdown = async () => {
    const triggerButton = screen.getByRole('button', { name: /open time picker/i });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      const dropdown = screen.getByRole('dialog');
      expect(dropdown).toBeInTheDocument();
      expect(dropdown).toHaveAttribute('aria-hidden', 'false');
    });

    return screen.getByRole('dialog');
  };

  describe('Opening dropdown and initial focus', () => {
    it('should focus on dropdown when opened with click', async () => {
      render(<TimePicker {...defaultProps} />);

      const dropdown = await openDropdown();

      // Dropdown should be focusable and focused
      expect(dropdown).toHaveAttribute('tabindex', '0');
      expect(document.activeElement).toBe(dropdown);
    });

    it('should highlight currently selected values when dropdown opens', async () => {
      render(
        <TimePicker
          {...defaultProps}
          value='14:30'
        />,
      );

      await openDropdown();

      // Selected hour should be visually highlighted
      const selectedHour = screen.getByRole('button', { name: '14' });
      expect(selectedHour).toHaveClass('dropdownOptionSelected');

      // Selected minute should be visually highlighted
      const selectedMinute = screen.getByRole('button', { name: '30' });
      expect(selectedMinute).toHaveClass('dropdownOptionSelected');
    });

    it('should start keyboard focus on first column (hours)', async () => {
      render(
        <TimePicker
          {...defaultProps}
          value='14:30'
        />,
      );

      await openDropdown();

      // First column (hours) should have keyboard focus indicator
      const selectedHour = screen.getByRole('button', { name: '14' });
      expect(selectedHour).toHaveClass('dropdownOptionFocused');
    });
  });

  describe('Navigation within columns (up/down arrows)', () => {
    it('should navigate down in hours column and immediately update value', async () => {
      const onChange = jest.fn();
      render(
        <TimePicker
          {...defaultProps}
          value='14:30'
          onChange={onChange}
        />,
      );

      const dropdown = await openDropdown();

      // Press arrow down - should move from 14 to 15
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('15:30');
      });

      // New hour should be highlighted and focused
      const newHour = screen.getByRole('button', { name: '15' });
      expect(newHour).toHaveClass('dropdownOptionSelected');
      expect(newHour).toHaveClass('dropdownOptionFocused');
    });

    it('should navigate up in hours column and immediately update value', async () => {
      const onChange = jest.fn();
      render(
        <TimePicker
          {...defaultProps}
          value='14:30'
          onChange={onChange}
        />,
      );

      const dropdown = await openDropdown();

      // Press arrow up - should move from 14 to 13
      fireEvent.keyDown(dropdown, { key: 'ArrowUp' });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('13:30');
      });

      // New hour should be highlighted and focused
      const newHour = screen.getByRole('button', { name: '13' });
      expect(newHour).toHaveClass('dropdownOptionSelected');
      expect(newHour).toHaveClass('dropdownOptionFocused');
    });

    it('should wrap from 23 to 00 when navigating down at end', async () => {
      const onChange = jest.fn();
      render(
        <TimePicker
          {...defaultProps}
          value='23:30'
          onChange={onChange}
        />,
      );

      const dropdown = await openDropdown();

      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('00:30');
      });
    });

    it('should wrap from 00 to 23 when navigating up at beginning', async () => {
      const onChange = jest.fn();
      render(
        <TimePicker
          {...defaultProps}
          value='00:30'
          onChange={onChange}
        />,
      );

      const dropdown = await openDropdown();

      fireEvent.keyDown(dropdown, { key: 'ArrowUp' });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('23:30');
      });
    });

    it('should handle minutes column navigation', async () => {
      const onChange = jest.fn();
      render(
        <TimePicker
          {...defaultProps}
          value='14:30'
          onChange={onChange}
        />,
      );

      const dropdown = await openDropdown();

      // Move to minutes column first
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' });

      // Navigate down in minutes
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('14:31');
      });
    });

    it('should wrap minutes from 59 to 00', async () => {
      const onChange = jest.fn();
      render(
        <TimePicker
          {...defaultProps}
          value='14:59'
          onChange={onChange}
        />,
      );

      const dropdown = await openDropdown();

      // Move to minutes column
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' });

      // Navigate down from 59
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('14:00');
      });
    });
  });

  describe('Navigation between columns (left/right arrows)', () => {
    it('should move from hours to minutes with ArrowRight', async () => {
      render(
        <TimePicker
          {...defaultProps}
          value='14:30'
        />,
      );

      const dropdown = await openDropdown();

      // Initially focused on hours
      const hourOption = screen.getByRole('button', { name: '14' });
      expect(hourOption).toHaveClass('dropdownOptionFocused');

      fireEvent.keyDown(dropdown, { key: 'ArrowRight' });

      // Now focused on minutes
      const minuteOption = screen.getByRole('button', { name: '30' });
      expect(minuteOption).toHaveClass('dropdownOptionFocused');
      expect(hourOption).not.toHaveClass('dropdownOptionFocused');
    });

    it('should move from minutes back to hours with ArrowLeft', async () => {
      render(
        <TimePicker
          {...defaultProps}
          value='14:30'
        />,
      );

      const dropdown = await openDropdown();

      // Move to minutes first
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' });

      // Move back to hours
      fireEvent.keyDown(dropdown, { key: 'ArrowLeft' });

      const hourOption = screen.getByRole('button', { name: '14' });
      expect(hourOption).toHaveClass('dropdownOptionFocused');
    });

    it('should navigate through all columns in seconds format', async () => {
      render(
        <TimePicker
          {...defaultProps}
          value='14:30:45'
          format='HH:mm:ss'
        />,
      );

      const dropdown = await openDropdown();

      // Start on hours
      let focusedOption = screen.getByRole('button', { name: '14' });
      expect(focusedOption).toHaveClass('dropdownOptionFocused');

      // Move to minutes
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' });
      focusedOption = screen.getByRole('button', { name: '30' });
      expect(focusedOption).toHaveClass('dropdownOptionFocused');

      // Move to seconds
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' });
      focusedOption = screen.getByRole('button', { name: '45' });
      expect(focusedOption).toHaveClass('dropdownOptionFocused');

      // Wrap back to hours
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' });
      focusedOption = screen.getByRole('button', { name: '14' });
      expect(focusedOption).toHaveClass('dropdownOptionFocused');
    });

    it('should handle AM/PM navigation in 12-hour format', async () => {
      render(
        <TimePicker
          {...defaultProps}
          value='02:30 PM'
          format='hh:mm a'
        />,
      );

      const dropdown = await openDropdown();

      // Navigate to AM/PM column
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' }); // to minutes
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' }); // to period

      const pmOption = screen.getByRole('button', { name: 'PM' });
      expect(pmOption).toHaveClass('dropdownOptionFocused');
    });
  });

  describe('Closing dropdown', () => {
    it('should close dropdown on Enter key', async () => {
      render(<TimePicker {...defaultProps} />);

      await openDropdown();

      const dropdown = screen.getByRole('dialog');
      fireEvent.keyDown(dropdown, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown on Escape key', async () => {
      render(<TimePicker {...defaultProps} />);

      await openDropdown();

      const dropdown = screen.getByRole('dialog');
      fireEvent.keyDown(dropdown, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should restore focus to trigger button when closed with keyboard', async () => {
      render(<TimePicker {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: /open time picker/i });
      await openDropdown();

      const dropdown = screen.getByRole('dialog');
      fireEvent.keyDown(dropdown, { key: 'Enter' });

      await waitFor(() => {
        expect(document.activeElement).toBe(triggerButton);
      });
    });
  });

  describe('Disabled options handling', () => {
    it('should skip disabled options when navigating', async () => {
      const onChange = jest.fn();
      render(
        <TimePicker
          {...defaultProps}
          value='14:30'
          minTime='10:00'
          maxTime='16:00'
          onChange={onChange}
        />,
      );

      const dropdown = await openDropdown();

      // Navigate up multiple times from 14 - should skip to 13, 12, 11, 10 and stop
      for (let i = 0; i < 6; i++) {
        fireEvent.keyDown(dropdown, { key: 'ArrowUp' });
      }

      // Should stop at 10 (minTime), not wrap to 23
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('10:30');
      });

      const hour10 = screen.getByRole('button', { name: '10' });
      expect(hour10).toHaveClass('dropdownOptionSelected');
      expect(hour10).toHaveClass('dropdownOptionFocused');
    });

    it('should not focus on disabled options', async () => {
      render(
        <TimePicker
          {...defaultProps}
          value='16:30'
          minTime='10:00'
          maxTime='16:00'
        />,
      );

      const dropdown = await openDropdown();

      // Try to navigate down from 16 - should not move to 17 (disabled)
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

      // Should stay on 16
      const hour16 = screen.getByRole('button', { name: '16' });
      expect(hour16).toHaveClass('dropdownOptionFocused');

      // Hour 17 should be disabled and not focused
      const hour17 = screen.getByRole('button', { name: '17' });
      expect(hour17).toHaveClass('dropdownOptionDisabled');
      expect(hour17).not.toHaveClass('dropdownOptionFocused');
    });
  });

  describe('Scroll behavior', () => {
    it('should scroll focused option into view', async () => {
      render(
        <TimePicker
          {...defaultProps}
          value='14:30'
        />,
      );

      await openDropdown();

      // Navigate down - should trigger scrollIntoView
      const dropdown = screen.getByRole('dialog');
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

      await waitFor(() => {
        const hour15 = screen.getByRole('button', { name: '15' });
        expect(hour15.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'nearest',
        });
      });
    });

    it('should prevent page scrolling when dropdown has focus', async () => {
      render(<TimePicker {...defaultProps} />);

      const dropdown = await openDropdown();

      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = jest.spyOn(keydownEvent, 'preventDefault');
      dropdown.dispatchEvent(keydownEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle rapid navigation smoothly', async () => {
      const onChange = jest.fn();
      render(
        <TimePicker
          {...defaultProps}
          value='14:30'
          onChange={onChange}
        />,
      );

      const dropdown = await openDropdown();

      // Rapid navigation - should handle all events
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      }

      // Should end up at 19:30
      await waitFor(() => {
        expect(onChange).toHaveBeenLastCalledWith('19:30');
      });

      const hour19 = screen.getByRole('button', { name: '19' });
      expect(hour19).toHaveClass('dropdownOptionFocused');
    });
  });

  describe('12-hour format specifics', () => {
    it('should handle AM/PM toggle with up/down arrows', async () => {
      const onChange = jest.fn();
      render(
        <TimePicker
          {...defaultProps}
          value='02:30 PM'
          format='hh:mm a'
          onChange={onChange}
        />,
      );

      const dropdown = await openDropdown();

      // Navigate to AM/PM column
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' }); // to minutes
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' }); // to period

      // Toggle from PM to AM
      fireEvent.keyDown(dropdown, { key: 'ArrowUp' });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('02:30 AM');
      });

      const amOption = screen.getByRole('button', { name: 'AM' });
      expect(amOption).toHaveClass('dropdownOptionSelected');
      expect(amOption).toHaveClass('dropdownOptionFocused');
    });

    it('should handle hour display correctly in 12-hour format', async () => {
      const onChange = jest.fn();
      render(
        <TimePicker
          {...defaultProps}
          value='13:30'
          format='hh:mm a'
          onChange={onChange}
        />,
      );

      const dropdown = await openDropdown();

      // Should show as 01 PM, focused on hour 01
      const hour01 = screen.getByRole('button', { name: '01' });
      expect(hour01).toHaveClass('dropdownOptionFocused');

      // Navigate down to 02
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('14:30'); // 2 PM = 14:30 in 24h
      });
    });
  });

  describe('Complex scenarios', () => {
    it('should handle all keys without interfering with other functionality', async () => {
      render(<TimePicker {...defaultProps} />);

      const dropdown = await openDropdown();

      // Test all supported keys
      const keysToTest = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'];

      keysToTest.forEach((key) => {
        const event = { key, preventDefault: jest.fn(), stopPropagation: jest.fn() };
        fireEvent.keyDown(dropdown, event);

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
          expect(event.preventDefault).toHaveBeenCalled();
        }
      });
    });

    it('should ignore non-navigation keys', async () => {
      render(<TimePicker {...defaultProps} />);

      const dropdown = await openDropdown();

      // Test non-navigation keys - should be ignored
      const ignoredKeys = ['Tab', 'Space', 'a', '1', 'Backspace'];

      ignoredKeys.forEach((key) => {
        const event = { key, preventDefault: jest.fn() };
        fireEvent.keyDown(dropdown, event);
        expect(event.preventDefault).not.toHaveBeenCalled();
      });

      // Dropdown should still be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
