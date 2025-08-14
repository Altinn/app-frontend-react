import React from 'react';

import { screen } from '@testing-library/react';

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
});
