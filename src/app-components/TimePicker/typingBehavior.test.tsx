import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react';

import { TimePicker } from 'src/app-components/TimePicker/TimePicker';

describe('TimePicker Typing Behavior - No Initial Value Bug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('When starting with no initial value', () => {
    it('should allow typing "22" in hours without reverting to "02"', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <TimePicker
          id='test-timepicker'
          value=''
          onChange={onChange}
          aria-label='Select time'
        />,
      );

      const hoursInput = container.querySelector('input[aria-label="Select time hours"]') as HTMLInputElement;
      expect(hoursInput).toBeInTheDocument();

      // Focus the hours input
      hoursInput.focus();

      // Type "2"
      fireEvent.keyPress(hoursInput, { key: '2', charCode: 50 });
      expect(hoursInput.value).toBe('02');

      // Type "2" again - should result in "22"
      fireEvent.keyPress(hoursInput, { key: '2', charCode: 50 });
      expect(hoursInput.value).toBe('22');

      // Wait for any async updates
      await waitFor(() => {
        expect(hoursInput.value).toBe('22');
      });

      // Even after timeout, should still be "22"
      jest.advanceTimersByTime(1100);
      await waitFor(() => {
        expect(hoursInput.value).toBe('22');
      });
    });

    it('should allow typing "15" in hours without reverting', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <TimePicker
          id='test-timepicker'
          value=''
          onChange={onChange}
          aria-label='Select time'
        />,
      );

      const hoursInput = container.querySelector('input[aria-label="Select time hours"]') as HTMLInputElement;

      hoursInput.focus();

      // Type "1"
      fireEvent.keyPress(hoursInput, { key: '1', charCode: 49 });
      expect(hoursInput.value).toBe('01');

      // Type "5" - should result in "15"
      fireEvent.keyPress(hoursInput, { key: '5', charCode: 53 });
      expect(hoursInput.value).toBe('15');

      // Wait for buffer timeout
      jest.advanceTimersByTime(1100);

      await waitFor(() => {
        expect(hoursInput.value).toBe('15');
        expect(onChange).toHaveBeenCalledWith('15:00');
      });
    });

    it('should allow typing "45" in minutes without reverting', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <TimePicker
          id='test-timepicker'
          value=''
          onChange={onChange}
          aria-label='Select time'
        />,
      );

      const minutesInput = container.querySelector('input[aria-label="Select time minutes"]') as HTMLInputElement;

      minutesInput.focus();

      // Type "4"
      fireEvent.keyPress(minutesInput, { key: '4', charCode: 52 });
      expect(minutesInput.value).toBe('04');

      // Type "5" - should result in "45"
      fireEvent.keyPress(minutesInput, { key: '5', charCode: 53 });
      expect(minutesInput.value).toBe('45');

      // Should not revert after timeout
      jest.advanceTimersByTime(1100);

      await waitFor(() => {
        expect(minutesInput.value).toBe('45');
      });
    });

    it('should handle typing "22" in minutes and maintain the value', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <TimePicker
          id='test-timepicker'
          value=''
          onChange={onChange}
          aria-label='Select time'
        />,
      );

      const minutesInput = container.querySelector('input[aria-label="Select time minutes"]') as HTMLInputElement;

      minutesInput.focus();

      // Type "2"
      fireEvent.keyPress(minutesInput, { key: '2', charCode: 50 });
      expect(minutesInput.value).toBe('02');

      // Type "2" again - should show "22" and keep it
      fireEvent.keyPress(minutesInput, { key: '2', charCode: 50 });
      expect(minutesInput.value).toBe('22');

      // Should not revert to "02" after async updates
      await waitFor(() => {
        expect(minutesInput.value).toBe('22');
      });

      // Should persist after timeout
      jest.advanceTimersByTime(1100);
      await waitFor(() => {
        expect(minutesInput.value).toBe('22');
        expect(onChange).toHaveBeenCalledWith('00:22');
      });
    });
  });

  describe('When starting with an existing value', () => {
    it('should allow overwriting hours by typing "22"', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <TimePicker
          id='test-timepicker'
          value='14:30'
          onChange={onChange}
          aria-label='Select time'
        />,
      );

      const hoursInput = container.querySelector('input[aria-label="Select time hours"]') as HTMLInputElement;

      hoursInput.focus();

      // Clear and type "2"
      fireEvent.keyDown(hoursInput, { key: 'Delete' });
      fireEvent.keyPress(hoursInput, { key: '2', charCode: 50 });
      expect(hoursInput.value).toBe('02');

      // Type "2" again - should result in "22"
      fireEvent.keyPress(hoursInput, { key: '2', charCode: 50 });
      expect(hoursInput.value).toBe('22');

      // Should maintain "22"
      await waitFor(() => {
        expect(hoursInput.value).toBe('22');
      });

      jest.advanceTimersByTime(1100);
      await waitFor(() => {
        expect(hoursInput.value).toBe('22');
        expect(onChange).toHaveBeenCalledWith('22:30');
      });
    });
  });

  describe('Buffer management during rapid typing', () => {
    it('should handle rapid typing without losing buffer state', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <TimePicker
          id='test-timepicker'
          value=''
          onChange={onChange}
          aria-label='Select time'
        />,
      );

      const hoursInput = container.querySelector('input[aria-label="Select time hours"]') as HTMLInputElement;
      hoursInput.focus();

      // Rapidly type "1" then "8"
      fireEvent.keyPress(hoursInput, { key: '1', charCode: 49 });
      fireEvent.keyPress(hoursInput, { key: '8', charCode: 56 });

      // Should show "18" immediately
      expect(hoursInput.value).toBe('18');

      // Should maintain after updates
      await waitFor(() => {
        expect(hoursInput.value).toBe('18');
      });
    });

    it('should not clear buffer when value updates from parent', async () => {
      const onChange = jest.fn();
      const { container, rerender } = render(
        <TimePicker
          id='test-timepicker'
          value=''
          onChange={onChange}
          aria-label='Select time'
        />,
      );

      const hoursInput = container.querySelector('input[aria-label="Select time hours"]') as HTMLInputElement;
      hoursInput.focus();

      // Type "2"
      fireEvent.keyPress(hoursInput, { key: '2', charCode: 50 });

      // Simulate parent updating the value
      rerender(
        <TimePicker
          id='test-timepicker'
          value='02:00'
          onChange={onChange}
          aria-label='Select time'
        />,
      );

      // Type another "2" - should result in "22", not "02"
      fireEvent.keyPress(hoursInput, { key: '2', charCode: 50 });
      expect(hoursInput.value).toBe('22');
    });
  });

  describe('Focus and blur behavior', () => {
    it('should clear buffer on blur but maintain value', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <TimePicker
          id='test-timepicker'
          value=''
          onChange={onChange}
          aria-label='Select time'
        />,
      );

      const hoursInput = container.querySelector('input[aria-label="Select time hours"]') as HTMLInputElement;
      const minutesInput = container.querySelector('input[aria-label="Select time minutes"]') as HTMLInputElement;

      hoursInput.focus();

      // Type "2"
      fireEvent.keyPress(hoursInput, { key: '2', charCode: 50 });
      expect(hoursInput.value).toBe('02');

      // Type "3" to make "23"
      fireEvent.keyPress(hoursInput, { key: '3', charCode: 51 });
      expect(hoursInput.value).toBe('23');

      // Blur by focusing another input
      minutesInput.focus();

      // Value should be maintained
      await waitFor(() => {
        expect(hoursInput.value).toBe('23');
        expect(onChange).toHaveBeenCalledWith('23:00');
      });
    });

    it('should allow continuing to type after refocusing', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <TimePicker
          id='test-timepicker'
          value=''
          onChange={onChange}
          aria-label='Select time'
        />,
      );

      const hoursInput = container.querySelector('input[aria-label="Select time hours"]') as HTMLInputElement;

      // First typing session
      hoursInput.focus();
      fireEvent.keyPress(hoursInput, { key: '1', charCode: 49 });
      expect(hoursInput.value).toBe('01');

      // Blur and refocus
      hoursInput.blur();
      await waitFor(() => {});
      hoursInput.focus();

      // Should be able to type new value
      fireEvent.keyPress(hoursInput, { key: '2', charCode: 50 });
      expect(hoursInput.value).toBe('02');

      fireEvent.keyPress(hoursInput, { key: '2', charCode: 50 });
      expect(hoursInput.value).toBe('22');
    });
  });
});
