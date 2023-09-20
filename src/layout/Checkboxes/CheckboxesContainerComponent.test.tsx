import React from 'react';

import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CheckboxContainerComponent } from 'src/layout/Checkboxes/CheckboxesContainerComponent';
import { LayoutStyle } from 'src/layout/common.generated';
import { renderGenericComponentTest } from 'src/testUtils';
import type { IOptionsState } from 'src/features/options';
import type { IOption } from 'src/layout/common.generated';
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

const twoOptions = threeOptions.slice(1);

interface Props extends Partial<RenderGenericComponentTestProps<'Checkboxes'>> {
  optionState?: IOptionsState;
  options?: IOption[];
}

const render = ({ component, genericProps, optionState }: Props = {}, options: IOption[] | undefined) =>
  renderGenericComponentTest({
    type: 'Checkboxes',
    renderer: (props) => <CheckboxContainerComponent {...props} />,
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
    mockedQueries: {
      fetchOptions: () => Promise.resolve(options || []),
    },
  });
const getCheckbox = ({ name, isChecked = false }) =>
  screen.getByRole('checkbox', {
    name,
    checked: isChecked,
  });

describe('CheckboxContainerComponent', () => {
  jest.useFakeTimers();
  const user = userEvent.setup({
    advanceTimers: (time) => {
      act(() => {
        jest.advanceTimersByTime(time);
      });
    },
  });

  it('should call handleDataChange with value of preselectedOptionIndex when simpleBinding is not set', async () => {
    const handleChange = jest.fn();
    render(
      {
        component: {
          preselectedOptionIndex: 1,
        },
        genericProps: {
          handleDataChange: handleChange,
          formData: {
            simpleBinding: undefined,
          },
        },
      },
      threeOptions,
    );

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('sweden', { validate: true });
    });
  });

  it('should not call handleDataChange when simpleBinding is set and preselectedOptionIndex', async () => {
    const handleChange = jest.fn();
    render(
      {
        component: {
          preselectedOptionIndex: 0,
        },
        genericProps: {
          handleDataChange: handleChange,
          formData: {
            simpleBinding: 'denmark',
          },
        },
      },
      threeOptions,
    );

    await waitFor(() => {
      expect(getCheckbox({ name: 'Norway' })).toBeInTheDocument();
    });
    expect(getCheckbox({ name: 'Sweden' })).toBeInTheDocument();
    expect(getCheckbox({ name: 'Denmark', isChecked: true })).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should show several checkboxes as selected based on values in simpleBinding', async () => {
    const handleChange = jest.fn();
    render(
      {
        genericProps: {
          handleDataChange: handleChange,
          formData: {
            simpleBinding: 'norway,denmark',
          },
        },
      },
      threeOptions,
    );

    await waitFor(() => {
      expect(getCheckbox({ name: 'Norway', isChecked: true })).toBeInTheDocument();
    });
    expect(getCheckbox({ name: 'Sweden' })).toBeInTheDocument();
    expect(getCheckbox({ name: 'Denmark', isChecked: true })).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalledWith();
  });

  it('should not set any as selected when no binding and no preselectedOptionIndex is set', async () => {
    const handleChange = jest.fn();
    render({ genericProps: { handleDataChange: handleChange } }, threeOptions);

    await waitFor(() => {
      expect(getCheckbox({ name: 'Norway' })).toBeInTheDocument();
    });
    expect(getCheckbox({ name: 'Sweden' })).toBeInTheDocument();
    expect(getCheckbox({ name: 'Denmark' })).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should call handleDataChange with updated values when selection changes', async () => {
    const handleChange = jest.fn();
    render(
      {
        genericProps: {
          handleDataChange: handleChange,
          formData: {
            simpleBinding: 'norway',
          },
        },
      },
      threeOptions,
    );
    await waitFor(() => {
      expect(getCheckbox({ name: 'Norway', isChecked: true })).toBeInTheDocument();
    });
    expect(getCheckbox({ name: 'Sweden' })).toBeInTheDocument();
    expect(getCheckbox({ name: 'Denmark' })).toBeInTheDocument();
    await act(() => user.click(getCheckbox({ name: 'Denmark' })));

    expect(handleChange).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();

    expect(handleChange).toHaveBeenCalledWith('norway,denmark', { validate: true });
  });

  it('should call handleDataChange with updated values when deselecting item', async () => {
    const handleChange = jest.fn();
    render(
      {
        genericProps: {
          handleDataChange: handleChange,
          formData: {
            simpleBinding: 'norway,denmark',
          },
        },
      },
      threeOptions,
    );
    await waitFor(() => {
      expect(getCheckbox({ name: 'Norway', isChecked: true })).toBeInTheDocument();
    });
    expect(getCheckbox({ name: 'Sweden' })).toBeInTheDocument();
    expect(getCheckbox({ name: 'Denmark', isChecked: true })).toBeInTheDocument();

    await act(() => user.click(getCheckbox({ name: 'Denmark', isChecked: true })));

    expect(handleChange).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();

    expect(handleChange).toHaveBeenCalledWith('norway', { validate: true });
  });

  it('should call handleDataChange instantly on blur when the value has changed', async () => {
    const handleChange = jest.fn();
    render(
      {
        genericProps: {
          handleDataChange: handleChange,
          formData: {
            simpleBinding: 'norway',
          },
        },
      },
      threeOptions,
    );

    let denmark: HTMLElement;
    await waitFor(() => {
      denmark = getCheckbox({ name: 'Denmark' });
      expect(denmark).toBeInTheDocument();
    });

    await act(() => user.click(denmark));

    expect(handleChange).not.toHaveBeenCalled();

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => fireEvent.blur(denmark));

    expect(handleChange).toHaveBeenCalledWith('norway,denmark', { validate: true });
  });

  it('should not call handleDataChange on blur when the value is unchanged', async () => {
    const handleChange = jest.fn();
    render(
      {
        genericProps: {
          handleDataChange: handleChange,
        },
      },
      threeOptions,
    );

    await waitFor(() => {
      expect(getCheckbox({ name: 'Denmark' })).toBeInTheDocument();
    });
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => {
      fireEvent.focus(getCheckbox({ name: 'Denmark' }));
      fireEvent.blur(getCheckbox({ name: 'Denmark' }));
    });

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should call handleDataChange onBlur with no commas in string when starting with empty string formData', async () => {
    const handleChange = jest.fn();
    render(
      {
        genericProps: {
          handleDataChange: handleChange,
          formData: {
            simpleBinding: '',
          },
        },
      },
      threeOptions,
    );

    await waitFor(() => {
      expect(getCheckbox({ name: 'Norway' })).toBeInTheDocument();
    });
    expect(getCheckbox({ name: 'Sweden' })).toBeInTheDocument();
    expect(getCheckbox({ name: 'Denmark' })).toBeInTheDocument();

    await act(() => user.click(getCheckbox({ name: 'Denmark' })));

    expect(handleChange).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();

    expect(handleChange).toHaveBeenCalledWith('denmark', { validate: true });
  });

  it('should show spinner while waiting for options', () => {
    render(
      {
        component: {
          optionsId: 'loadingOptions',
        },
      },
      threeOptions,
    );
    expect(screen.getByTestId('altinn-spinner')).toBeInTheDocument();
  });

  it('should show items in a row when layout is "row" and options count is 3', () => {
    const { container } = render(
      {
        component: {
          optionsId: 'countries',
          layout: LayoutStyle.Row,
        },
      },
      threeOptions,
    );

    // eslint-disable-next-line
    expect(container.querySelector('fieldset > div')).toHaveStyle('flex-direction: row;');
  });

  it('should show items in a row when layout is not defined, and options count is 2', () => {
    const { container } = render(
      {
        component: {
          optionsId: 'countries',
        },
        optionState: {
          options: {
            countries: {
              id: 'countries',
              options: twoOptions,
            },
          },
        } as unknown as IOptionsState,
      },
      twoOptions,
    );

    // eslint-disable-next-line
    expect(container.querySelector('fieldset > div')).toHaveStyle('flex-direction: row;');
  });

  it('should show items in a column when layout is "column" and options count is 2 ', () => {
    const { container } = render(
      {
        component: {
          optionsId: 'countries',
          layout: LayoutStyle.Column,
        },
        optionState: {
          options: {
            countries: {
              id: 'countries',
              options: twoOptions,
            },
          },
        } as unknown as IOptionsState,
      },
      twoOptions,
    );

    // eslint-disable-next-line
    expect(container.querySelector('fieldset > div')).toHaveStyle('flex-direction: column;');
  });

  it('should show items in a columns when layout is not defined, and options count is 3', async () => {
    const { container } = render(
      {
        component: {
          optionsId: 'countries',
        },
      },
      threeOptions,
    );

    // eslint-disable-next-line
    await waitFor(() => expect(container.querySelector('fieldset > div')).toHaveStyle('flex-direction: column;'));
  });

  it('should present replaced label if setup with values from repeating group in redux and trigger handleDataChanged with replaced values', async () => {
    const handleDataChange = jest.fn();

    render(
      {
        genericProps: { handleDataChange },
        component: {
          optionsId: undefined,
          source: {
            group: 'someGroup',
            label: 'option.from.rep.group.label',
            description: 'option.from.rep.group.description',
            helpText: 'option.from.rep.group.helpText',
            value: 'someGroup[{0}].valueField',
          },
        },
      },
      undefined,
    );

    await waitFor(() => {
      expect(getCheckbox({ name: 'The value from the group is: Label for first' })).toBeInTheDocument();
    });
    expect(getCheckbox({ name: 'The value from the group is: Label for second' })).toBeInTheDocument();
    expect(screen.getByText('Description: The value from the group is: Label for first')).toBeInTheDocument();
    expect(screen.getByText('Description: The value from the group is: Label for second')).toBeInTheDocument();

    await act(() =>
      user.click(screen.getByRole('button', { name: 'Help text for The value from the group is: Label for first' })),
    );
    expect(screen.getByText('Help Text: The value from the group is: Label for first')).toBeInTheDocument();

    await act(() =>
      user.click(screen.getByRole('button', { name: 'Help text for The value from the group is: Label for second' })),
    );
    expect(screen.getByText('Help Text: The value from the group is: Label for second')).toBeInTheDocument();

    await act(() => user.click(getCheckbox({ name: 'The value from the group is: Label for second' })));

    expect(handleDataChange).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();

    expect(handleDataChange).toHaveBeenCalledWith('Value for second', { validate: true });
  });
});
