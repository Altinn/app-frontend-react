import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import { TimePicker } from 'src/app-components/TimePicker/TimePicker';

describe('Debug typing behavior', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should debug why second 2 results in 02', async () => {
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

    console.log('Initial state:', {
      value: hoursInput.value,
      focused: document.activeElement === hoursInput,
    });

    // Focus first
    hoursInput.focus();
    console.log('After focus:', {
      value: hoursInput.value,
      focused: document.activeElement === hoursInput,
    });

    // Type first "2"
    fireEvent.keyPress(hoursInput, { key: '2', charCode: 50 });
    console.log('After first "2":', {
      value: hoursInput.value,
      focused: document.activeElement === hoursInput,
      onChange: onChange.mock.calls,
    });

    // Advance a small amount to ensure state is stable
    jest.advanceTimersByTime(50);

    // Type second "2"
    fireEvent.keyPress(hoursInput, { key: '2', charCode: 50 });
    console.log('After second "2":', {
      value: hoursInput.value,
      focused: document.activeElement === hoursInput,
      onChange: onChange.mock.calls,
    });

    expect(hoursInput.value).toBe('22');
  });
});
