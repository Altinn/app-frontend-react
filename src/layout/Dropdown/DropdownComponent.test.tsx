import React from 'react';

import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DropdownComponent } from 'src/layout/Dropdown/DropdownComponent';
import { renderGenericComponentTest } from 'src/testUtils';
import type { RenderGenericComponentTestProps } from 'src/testUtils';

const render = ({ component, genericProps }: Partial<RenderGenericComponentTestProps<'Dropdown'>> = {}) => {
  const countries = {
    id: 'countries',
    options: [
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
    ],
  };
  renderGenericComponentTest({
    type: 'Dropdown',
    renderer: (props) => <DropdownComponent {...props} />,
    component: {
      optionsId: 'countries',
      readOnly: false,
      ...component,
    },
    genericProps: {
      handleDataChange: jest.fn(),
      isValid: true,
      ...genericProps,
    },
    manipulateState: (state) => {
      state.optionState = {
        options: {
          countries,
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
};

describe('DropdownComponent', () => {
  jest.useFakeTimers();

  const user = userEvent.setup({
    advanceTimers: (time) => {
      act(() => {
        jest.advanceTimersByTime(time);
      });
    },
  });

  it('should trigger handleDataChange when option is selected', async () => {
    const handleDataChange = jest.fn();
    render({
      genericProps: {
        handleDataChange,
      },
    });

    await act(() => user.click(screen.getByRole('combobox')));
    await act(() => user.click(screen.getByText('Sweden')));

    expect(handleDataChange).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();

    expect(handleDataChange).toHaveBeenCalledWith('sweden', { validate: true });
  });

  it('should show as disabled when readOnly is true', () => {
    render({
      component: {
        readOnly: true,
      },
    });

    const select = screen.getByRole('combobox');

    expect(select).toHaveProperty('disabled', true);
  });

  it('should not show as disabled when readOnly is false', () => {
    render({
      component: {
        readOnly: false,
      },
    });

    const select = screen.getByRole('combobox');

    expect(select).toHaveProperty('disabled', false);
  });

  it('should trigger handleDataChange when preselectedOptionIndex is set', () => {
    const handleDataChange = jest.fn();
    render({
      component: {
        preselectedOptionIndex: 2,
      },
      genericProps: {
        handleDataChange,
      },
    });

    expect(handleDataChange).toHaveBeenCalledWith('denmark', { validate: true });
    expect(handleDataChange).toHaveBeenCalledTimes(1);
  });

  it('should trigger handleDataChange instantly on blur', async () => {
    const handleDataChange = jest.fn();
    render({
      component: {
        preselectedOptionIndex: 2,
      },
      genericProps: {
        handleDataChange,
      },
    });

    expect(handleDataChange).toHaveBeenCalledWith('denmark', { validate: true });
    const select = screen.getByRole('combobox');

    await act(() => user.click(select));

    expect(handleDataChange).toHaveBeenCalledTimes(1);

    await act(() => user.tab());

    expect(handleDataChange).toHaveBeenCalledWith('denmark', { validate: true });
    expect(handleDataChange).toHaveBeenCalledTimes(2);
  });

  it('should show spinner while waiting for options', () => {
    render({
      component: {
        optionsId: 'loadingOptions',
      },
    });

    expect(screen.getByTestId('altinn-spinner')).toBeInTheDocument();
  });

  it('should not show spinner when options are present', () => {
    render({
      component: {
        optionsId: 'countries',
      },
    });

    expect(screen.queryByTestId('altinn-spinner')).not.toBeInTheDocument();
  });

  it('should present replaced label if setup with values from repeating group in redux and trigger handleDataChanged with replaced values', async () => {
    const handleDataChange = jest.fn();
    render({
      component: {
        source: {
          group: 'someGroup',
          label: 'option.from.rep.group.label',
          value: 'someGroup[{0}].valueField',
        },
      },
      genericProps: {
        handleDataChange,
      },
    });

    await act(() => user.click(screen.getByRole('combobox')));
    await act(() => user.click(screen.getByText('The value from the group is: Label for first')));

    expect(handleDataChange).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();

    expect(handleDataChange).toHaveBeenCalledWith('Value for first', { validate: true });

    await act(() => user.click(screen.getByRole('combobox')));
    await act(() => user.click(screen.getByText('The value from the group is: Label for second')));

    expect(handleDataChange).toHaveBeenCalledTimes(1);

    jest.runOnlyPendingTimers();

    expect(handleDataChange).toHaveBeenCalledWith('Value for second', { validate: true });
    expect(handleDataChange).toHaveBeenCalledTimes(2);
  });

  it('should present the options list in the order it is provided when sortOrder is not specified', async () => {
    render({
      component: {
        optionsId: 'countries',
      },
    });

    await act(() => user.click(screen.getByRole('combobox')));
    const options = screen.getAllByRole('option');

    expect(options[0]).toHaveValue('norway');
    expect(options[1]).toHaveValue('sweden');
    expect(options[2]).toHaveValue('denmark');
  });

  it('should present the provided options list sorted alphabetically in ascending order when providing sortOrder "asc"', async () => {
    render({
      component: {
        optionsId: 'countries',
        sortOrder: 'asc',
      },
    });

    await act(() => user.click(screen.getByRole('combobox')));
    const options = screen.getAllByRole('option');

    expect(options[0]).toHaveValue('denmark');
    expect(options[1]).toHaveValue('norway');
    expect(options[2]).toHaveValue('sweden');
  });

  it('should present the provided options list sorted alphabetically in descending order when providing sortOrder "desc"', async () => {
    render({
      component: {
        optionsId: 'countries',
        sortOrder: 'desc',
      },
    });

    await act(() => user.click(screen.getByRole('combobox')));
    const options = screen.getAllByRole('option');

    expect(options[0]).toHaveValue('sweden');
    expect(options[1]).toHaveValue('norway');
    expect(options[2]).toHaveValue('denmark');
  });
});
