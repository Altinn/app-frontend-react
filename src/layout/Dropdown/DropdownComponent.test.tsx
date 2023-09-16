import React from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DropdownComponent } from 'src/layout/Dropdown/DropdownComponent';
import { renderGenericComponentTest } from 'src/testUtils';
import type { RenderGenericComponentTestProps } from 'src/testUtils';
import type { IGetOptionsUrlParams } from 'src/utils/urls/appUrlHelper';

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

const render = ({ component, genericProps }: Partial<RenderGenericComponentTestProps<'Dropdown'>> = {}, options) => {
  countries;
  const fetchOptions = () => Promise.resolve([...options] as unknown as IGetOptionsUrlParams);
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
    mockedQueries: {
      fetchOptions,
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
    render(
      {
        genericProps: {
          handleDataChange,
        },
      },
      countries.options,
    );

    await act(() => user.click(screen.getByRole('combobox')));
    await act(() => user.click(screen.getByText('Sweden')));

    expect(handleDataChange).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();

    expect(handleDataChange).toHaveBeenCalledWith('sweden', { validate: true });
  });

  it('should show as disabled when readOnly is true', () => {
    render(
      {
        component: {
          readOnly: true,
        },
      },
      countries.options,
    );

    const select = screen.getByRole('combobox');

    expect(select).toHaveProperty('disabled', true);
  });

  it('should not show as disabled when readOnly is false', () => {
    render(
      {
        component: {
          readOnly: false,
        },
      },
      countries.options,
    );

    const select = screen.getByRole('combobox');

    expect(select).toHaveProperty('disabled', false);
  });

  it('should trigger handleDataChange when preselectedOptionIndex is set', async () => {
    const handleDataChange = jest.fn();
    render(
      {
        component: {
          preselectedOptionIndex: 2,
        },
        genericProps: {
          handleDataChange,
        },
      },
      countries.options,
    );

    await waitFor(() => expect(handleDataChange).toHaveBeenCalledWith('denmark', { validate: true }));
    expect(handleDataChange).toHaveBeenCalledTimes(1);
  });

  it('should trigger handleDataChange instantly on blur', async () => {
    const handleDataChange = jest.fn();
    render(
      {
        component: {
          preselectedOptionIndex: 2,
        },
        genericProps: {
          handleDataChange,
        },
      },
      countries.options,
    );

    await waitFor(() => expect(handleDataChange).toHaveBeenCalledWith('denmark', { validate: true }));
    const select = screen.getByRole('combobox');

    await act(() => user.click(select));

    expect(handleDataChange).toHaveBeenCalledTimes(1);

    await act(() => user.tab());

    expect(handleDataChange).toHaveBeenCalledWith('denmark', { validate: true });
    expect(handleDataChange).toHaveBeenCalledTimes(2);
  });

  it('should show spinner while waiting for options', () => {
    render(
      {
        component: {
          optionsId: 'loadingOptions',
        },
      },
      countries.options,
    );

    expect(screen.getByTestId('altinn-spinner')).toBeInTheDocument();
  });

  it('should not show spinner when options are present', () => {
    render(
      {
        component: {
          optionsId: 'countries',
        },
      },
      countries.options,
    );

    expect(screen.queryByTestId('altinn-spinner')).not.toBeInTheDocument();
  });

  it('should present replaced label if setup with values from repeating group in redux and trigger handleDataChanged with replaced values', async () => {
    const handleDataChange = jest.fn();
    render(
      {
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
      },
      undefined,
    );

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
});
