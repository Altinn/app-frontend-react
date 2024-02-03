import React from 'react';

import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RadioButtonContainerComponent } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';
import { renderGenericComponentTest } from 'src/testUtils';
import type { RenderGenericComponentTestProps } from 'src/testUtils';

const threeOptions = [
  {
    label: 'Norway',
    value: 'norway',
  },
  {
    label: 'Sweden',
    value: 'sweden',
  },
  {
    label: 'Denmark',
    value: 'denmark',
  },
];

const render = ({
  component,
  genericProps,
  manipulateState,
}: Partial<RenderGenericComponentTestProps<'RadioButtons'>> = {}) =>
  renderGenericComponentTest({
    type: 'RadioButtons',
    renderer: (props) => <RadioButtonContainerComponent {...props} />,
    component: {
      options: [],
      optionsId: 'countries',
      preselectedOptionIndex: undefined,
      ...component,
    },
    genericProps: {
      legend: () => <span>legend</span>,
      handleDataChange: jest.fn(),
      ...genericProps,
    },
    manipulateState: manipulateState
      ? manipulateState
      : (state) => {
          state.optionState = {
            options: {
              countries: {
                id: 'countries',
                options: threeOptions,
              },
              loadingOptions: {
                id: 'loadingOptions',
                options: undefined,
                loading: true,
              },
            },
            error: {
              name: '',
              message: '',
            },
            loading: true,
          };
        },
  });

const getRadio = ({ name, isChecked = false }) =>
  screen.getByRole('radio', {
    name,
    checked: isChecked,
  });

describe('RadioButtonsContainerComponent', () => {
  it('should call handleDataChange with value of preselectedOptionIndex when simpleBinding is not set', () => {
    const handleChange = jest.fn();
    render({
      component: {
        preselectedOptionIndex: 1,
      },
      genericProps: {
        handleDataChange: handleChange,
        formData: {
          simpleBinding: undefined,
        },
      },
    });

    expect(handleChange).toHaveBeenCalledWith('sweden', { validate: true });
  });

  it('should not call handleDataChange when simpleBinding is set and preselectedOptionIndex', () => {
    const handleChange = jest.fn();
    render({
      component: {
        preselectedOptionIndex: 0,
      },
      genericProps: {
        handleDataChange: handleChange,
        formData: {
          simpleBinding: 'denmark',
        },
      },
    });

    expect(getRadio({ name: 'Norway' })).toBeInTheDocument();
    expect(getRadio({ name: 'Sweden' })).toBeInTheDocument();
    expect(getRadio({ name: 'Denmark', isChecked: true })).toBeInTheDocument();

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should not set any as selected when no binding and no preselectedOptionIndex is set', () => {
    const handleChange = jest.fn();
    render({ genericProps: { handleDataChange: handleChange } });

    expect(getRadio({ name: 'Norway' })).toBeInTheDocument();
    expect(getRadio({ name: 'Sweden' })).toBeInTheDocument();
    expect(getRadio({ name: 'Denmark' })).toBeInTheDocument();

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should call handleDataChange with updated value when selection changes', async () => {
    const handleChange = jest.fn();
    render({
      genericProps: {
        handleDataChange: handleChange,
        formData: {
          simpleBinding: 'norway',
        },
      },
    });

    expect(getRadio({ name: 'Norway', isChecked: true })).toBeInTheDocument();
    expect(getRadio({ name: 'Sweden' })).toBeInTheDocument();
    expect(getRadio({ name: 'Denmark' })).toBeInTheDocument();

    await userEvent.click(getRadio({ name: 'Denmark' }));

    expect(handleChange).not.toHaveBeenCalled();
    await waitFor(() => expect(handleChange).toHaveBeenCalledWith('denmark', { validate: true }));
  });

  it('should call handleDataChange instantly on blur when the value has changed', async () => {
    const handleChange = jest.fn();
    render({
      genericProps: {
        handleDataChange: handleChange,
        formData: {
          simpleBinding: 'norway',
        },
      },
    });

    const denmark = getRadio({ name: 'Denmark' });

    expect(denmark).toBeInTheDocument();

    await userEvent.click(denmark);

    expect(handleChange).not.toHaveBeenCalled();

    await userEvent.tab();

    expect(handleChange).toHaveBeenCalledWith('denmark', { validate: true });
  });

  it('should not call handleDataChange on blur when the value is unchanged', async () => {
    const handleChange = jest.fn();
    render({
      genericProps: {
        handleDataChange: handleChange,
      },
    });

    expect(getRadio({ name: 'Denmark' })).toBeInTheDocument();

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.focus(getRadio({ name: 'Denmark' }));
      fireEvent.blur(getRadio({ name: 'Denmark' }));
    });

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should show spinner while waiting for options', () => {
    render({
      component: {
        optionsId: 'loadingOptions',
      },
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should not show spinner when options are present', () => {
    render({
      component: {
        optionsId: 'countries',
      },
    });

    expect(screen.queryByTestId('altinn-spinner')).not.toBeInTheDocument();
  });

  it('should present replaced label, description and help text if setup with values from repeating group in redux and trigger handleDataChanged with replaced values', async () => {
    const handleDataChange = jest.fn();

    render({
      component: {
        source: {
          group: 'someGroup',
          label: 'option.from.rep.group.label',
          description: 'option.from.rep.group.description',
          helpText: 'option.from.rep.group.helpText',
          value: 'someGroup[{0}].valueField',
        },
      },
      genericProps: {
        handleDataChange,
      },
    });

    expect(getRadio({ name: /The value from the group is: Label for first/ })).toBeInTheDocument();
    expect(getRadio({ name: /The value from the group is: Label for second/ })).toBeInTheDocument();
    expect(screen.getByText('Description: The value from the group is: Label for first')).toBeInTheDocument();
    expect(screen.getByText('Description: The value from the group is: Label for second')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Help Text: The value from the group is: Label for first' }),
    );
    expect(await screen.findByRole('dialog')).toHaveTextContent(
      'Help Text: The value from the group is: Label for first',
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Help Text: The value from the group is: Label for second' }),
    );
    expect(await screen.findByRole('dialog')).toHaveTextContent(
      'Help Text: The value from the group is: Label for second',
    );

    await userEvent.click(getRadio({ name: /The value from the group is: Label for first/ }));
    expect(handleDataChange).not.toHaveBeenCalled();
    await waitFor(() => expect(handleDataChange).toHaveBeenCalledWith('Value for first', { validate: true }));
  }, 20000);
});
