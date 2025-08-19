import React from 'react';

import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { defaultDataTypeMock } from 'src/__mocks__/getLayoutSetsMock';
import { TimePickerComponent } from 'src/layout/TimePicker/TimePickerComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';

describe('TimePickerComponent', () => {
  it('should render time picker with label', async () => {
    await renderGenericComponentTest({
      type: 'TimePicker',
      renderer: (props) => <TimePickerComponent {...props} />,
      component: {
        id: 'time-picker',
        type: 'TimePicker',
        dataModelBindings: {
          simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
        },
        textResourceBindings: {
          title: 'Select time',
        },
        required: false,
        readOnly: false,
      },
    });

    expect(screen.getByText('Select time')).toBeInTheDocument();
  });

  it('should render time input fields', async () => {
    await renderGenericComponentTest({
      type: 'TimePicker',
      renderer: (props) => <TimePickerComponent {...props} />,
      component: {
        id: 'time-picker',
        type: 'TimePicker',
        dataModelBindings: {
          simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
        },
        format: 'HH:mm',
      },
    });

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(2); // Hours and minutes
    expect(inputs[0]).toHaveAttribute('aria-label', 'Hours');
    expect(inputs[1]).toHaveAttribute('aria-label', 'Minutes');
  });

  it('should render with 12-hour format', async () => {
    await renderGenericComponentTest({
      type: 'TimePicker',
      renderer: (props) => <TimePickerComponent {...props} />,
      component: {
        id: 'time-picker',
        type: 'TimePicker',
        dataModelBindings: {
          simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
        },
        format: 'hh:mm a',
      },
    });

    expect(screen.getByRole('button', { name: /AM|PM/i })).toBeInTheDocument();
  });

  it('should show seconds when format includes seconds', async () => {
    await renderGenericComponentTest({
      type: 'TimePicker',
      renderer: (props) => <TimePickerComponent {...props} />,
      component: {
        id: 'time-picker',
        type: 'TimePicker',
        dataModelBindings: {
          simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
        },
        format: 'HH:mm:ss',
      },
    });

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(3); // Hours, minutes, and seconds
  });

  it('should be disabled when readOnly is true', async () => {
    await renderGenericComponentTest({
      type: 'TimePicker',
      renderer: (props) => <TimePickerComponent {...props} />,
      component: {
        id: 'time-picker',
        type: 'TimePicker',
        dataModelBindings: {
          simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
        },
        readOnly: true,
      },
    });

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  describe('Dropdown Keyboard Navigation', () => {
    it('should open dropdown and allow immediate arrow up/down navigation', async () => {
      const user = userEvent.setup();
      
      await renderGenericComponentTest({
        type: 'TimePicker',
        renderer: (props) => <TimePickerComponent {...props} />,
        component: {
          id: 'time-picker',
          type: 'TimePicker',
          dataModelBindings: {
            simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
          },
          format: 'HH:mm',
        },
      });

      // Open dropdown
      const clockButton = screen.getByRole('button', { name: 'Open time picker' });
      await user.click(clockButton);

      // Should open with focus on dropdown
      const dropdown = screen.getByRole('dialog');
      expect(dropdown).toBeInTheDocument();

      // Arrow down should navigate to next hour option
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      
      // Should highlight next hour (15)
      await waitFor(() => {
        const focusedOption = screen.getByText('15');
        expect(focusedOption).toHaveClass('dropdownOptionFocused');
      });
    });

    it('should navigate between columns with arrow left/right', async () => {
      const user = userEvent.setup();
      
      await renderGenericComponentTest({
        type: 'TimePicker',
        renderer: (props) => <TimePickerComponent {...props} />,
        component: {
          id: 'time-picker',
          type: 'TimePicker',
          dataModelBindings: {
            simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
          },
          format: 'HH:mm',
        },
      });

      const clockButton = screen.getByRole('button', { name: 'Open time picker' });
      await user.click(clockButton);

      const dropdown = screen.getByRole('dialog');
      
      // Arrow right should move from hours to minutes column
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' });
      
      // Now arrow down should navigate minutes
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      
      await waitFor(() => {
        const focusedOption = screen.getByText('31');
        expect(focusedOption).toHaveClass('dropdownOptionFocused');
      });
    });

    it('should update time immediately with arrow navigation', async () => {
      const user = userEvent.setup();
      
      await renderGenericComponentTest({
        type: 'TimePicker',
        renderer: (props) => <TimePickerComponent {...props} />,
        component: {
          id: 'time-picker',
          type: 'TimePicker',
          dataModelBindings: {
            simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
          },
          format: 'HH:mm',
        },
      });

      // Set initial time
      const hoursInput = screen.getAllByRole('textbox')[0];
      const minutesInput = screen.getAllByRole('textbox')[1];
      
      await user.clear(hoursInput);
      await user.type(hoursInput, '14');
      await user.clear(minutesInput);
      await user.type(minutesInput, '30');

      const clockButton = screen.getByRole('button', { name: 'Open time picker' });
      await user.click(clockButton);

      const dropdown = screen.getByRole('dialog');
      
      // Navigate to different hour with arrow down
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      
      // Time should update immediately without pressing Enter
      await waitFor(() => {
        expect(hoursInput).toHaveValue('15');
      });
      
      // Navigate to minutes column and change value
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' });
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      
      // Minutes should update immediately 
      await waitFor(() => {
        expect(minutesInput).toHaveValue('31');
      });
    });

    it('should close dropdown with Enter key without changing value', async () => {
      const user = userEvent.setup();
      
      await renderGenericComponentTest({
        type: 'TimePicker',
        renderer: (props) => <TimePickerComponent {...props} />,
        component: {
          id: 'time-picker',
          type: 'TimePicker',
          dataModelBindings: {
            simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
          },
          format: 'HH:mm',
        },
      });

      const clockButton = screen.getByRole('button', { name: 'Open time picker' });
      await user.click(clockButton);

      const dropdown = screen.getByRole('dialog');
      
      // Press Enter without navigating
      fireEvent.keyDown(dropdown, { key: 'Enter' });
      
      // Should close dropdown
      await waitFor(() => {
        expect(dropdown).not.toBeInTheDocument();
      });
    });

    it('should close dropdown with Escape key', async () => {
      const user = userEvent.setup();
      
      await renderGenericComponentTest({
        type: 'TimePicker',
        renderer: (props) => <TimePickerComponent {...props} />,
        component: {
          id: 'time-picker',
          type: 'TimePicker',
          dataModelBindings: {
            simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
          },
          format: 'HH:mm',
        },
      });

      const clockButton = screen.getByRole('button', { name: 'Open time picker' });
      await user.click(clockButton);

      const dropdown = screen.getByRole('dialog');
      fireEvent.keyDown(dropdown, { key: 'Escape' });
      
      await waitFor(() => {
        expect(dropdown).not.toBeInTheDocument();
      });
    });

    it('should wrap navigation at column boundaries', async () => {
      const user = userEvent.setup();
      
      await renderGenericComponentTest({
        type: 'TimePicker',
        renderer: (props) => <TimePickerComponent {...props} />,
        component: {
          id: 'time-picker',
          type: 'TimePicker',
          dataModelBindings: {
            simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
          },
          format: 'hh:mm:ss a',
        },
      });

      const clockButton = screen.getByRole('button', { name: 'Open time picker' });
      await user.click(clockButton);

      const dropdown = screen.getByRole('dialog');
      
      // Navigate to last column (period)
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' }); // minutes
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' }); // seconds  
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' }); // period
      
      // Arrow right should wrap to first column (hours)
      fireEvent.keyDown(dropdown, { key: 'ArrowRight' });
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      
      await waitFor(() => {
        // Should navigate hours (next after 02 in 12-hour is 03)
        const focusedOption = screen.getByText('03');
        expect(focusedOption).toHaveClass('dropdownOptionFocused');
      });
    });

    it('should skip disabled options when navigating', async () => {
      const user = userEvent.setup();
      
      await renderGenericComponentTest({
        type: 'TimePicker',
        renderer: (props) => <TimePickerComponent {...props} />,
        component: {
          id: 'time-picker',
          type: 'TimePicker',
          dataModelBindings: {
            simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
          },
          format: 'HH:mm',
          minTime: '14:00',
          maxTime: '16:00',
        },
      });

      const clockButton = screen.getByRole('button', { name: 'Open time picker' });
      await user.click(clockButton);

      const dropdown = screen.getByRole('dialog');
      
      // Navigate up should skip to next valid hour (15, then 16)
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      
      await waitFor(() => {
        const focusedOption = screen.getByText('16');
        expect(focusedOption).toHaveClass('dropdownOptionFocused');
      });
    });

    it('should scroll focused option into view during navigation', async () => {
      const user = userEvent.setup();
      
      // Mock scrollIntoView since it's not available in test environment
      const mockScrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = mockScrollIntoView;
      
      await renderGenericComponentTest({
        type: 'TimePicker',
        renderer: (props) => <TimePickerComponent {...props} />,
        component: {
          id: 'time-picker',
          type: 'TimePicker',
          dataModelBindings: {
            simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
          },
          format: 'HH:mm',
        },
      });

      const clockButton = screen.getByRole('button', { name: 'Open time picker' });
      await user.click(clockButton);

      const dropdown = screen.getByRole('dialog');
      
      // Navigate several times to test scrolling
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      
      // Should call scrollIntoView for focused options
      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalled();
      });
      
      // Check that scroll behavior is 'smooth' and block is 'nearest'
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    });

    it('should auto-focus current value when dropdown opens', async () => {
      const user = userEvent.setup();
      
      await renderGenericComponentTest({
        type: 'TimePicker',
        renderer: (props) => <TimePickerComponent {...props} />,
        component: {
          id: 'time-picker',
          type: 'TimePicker',
          dataModelBindings: {
            simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
          },
          format: 'HH:mm',
        },
      });

      // Set a specific time value first
      const hoursInput = screen.getAllByRole('textbox')[0];
      const minutesInput = screen.getAllByRole('textbox')[1];
      
      await user.clear(hoursInput);
      await user.type(hoursInput, '15');
      await user.clear(minutesInput);
      await user.type(minutesInput, '45');

      // Open dropdown
      const clockButton = screen.getByRole('button', { name: 'Open time picker' });
      await user.click(clockButton);

      // Should immediately focus on current hour value (15)
      await waitFor(() => {
        const currentHourOption = screen.getByText('15');
        expect(currentHourOption).toHaveClass('dropdownOptionFocused');
      });
    });

    it('should prevent page scrolling when dropdown is focused', async () => {
      const user = userEvent.setup();
      
      // Mock focus method to track focus calls
      const mockFocus = jest.fn();
      HTMLElement.prototype.focus = mockFocus;
      
      await renderGenericComponentTest({
        type: 'TimePicker',
        renderer: (props) => <TimePickerComponent {...props} />,
        component: {
          id: 'time-picker',
          type: 'TimePicker',
          dataModelBindings: {
            simpleBinding: { dataType: defaultDataTypeMock, field: 'time' },
          },
          format: 'HH:mm',
        },
      });

      // Open dropdown
      const clockButton = screen.getByRole('button', { name: 'Open time picker' });
      await user.click(clockButton);

      const dropdown = screen.getByRole('dialog');
      
      // Verify dropdown gets focused
      await waitFor(() => {
        expect(mockFocus).toHaveBeenCalled();
      });
      
      // Verify dropdown has tabIndex to make it focusable
      expect(dropdown).toHaveAttribute('tabIndex', '-1');
    });
  });
});
