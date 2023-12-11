import React from 'react';

import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { AxiosResponse } from 'axios';

import { RadioButtonContainerComponent } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { IOption } from 'src/layout/common.generated';
import type { RenderGenericComponentTestProps } from 'src/test/renderWithProviders';

const threeOptions: IOption[] = [
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

interface Props extends Partial<RenderGenericComponentTestProps<'RadioButtons'>> {
  options?: IOption[];
  formData?: string;
}

const render = async ({ component, options, formData }: Props = {}) =>
  await renderGenericComponentTest({
    type: 'RadioButtons',
    renderer: (props) => <RadioButtonContainerComponent {...props} />,
    component: {
      optionsId: 'countries',
      preselectedOptionIndex: undefined,
      dataModelBindings: { simpleBinding: 'myRadio' },
      ...component,
    },
    queries: {
      fetchOptions: () =>
        options
          ? Promise.resolve({ data: options, headers: {} } as AxiosResponse<IOption[], any>)
          : Promise.reject(new Error('No options provided to render()')),
      fetchFormData: async () => ({
        myRadio: formData,
      }),
    },
  });

const getRadio = ({ name, isChecked = false }) =>
  screen.getByRole('radio', {
    name,
    checked: isChecked,
  });

const findRadio = ({ name, isChecked = false }) =>
  screen.findByRole('radio', {
    name,
    checked: isChecked,
  });

describe('RadioButtonsContainerComponent', () => {
  it('should call handleDataChange with value of preselectedOptionIndex when simpleBinding is not set', async () => {
    const { formDataMethods } = await render({
      component: {
        preselectedOptionIndex: 1,
      },
      options: threeOptions,
    });

    await waitFor(() =>
      expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({ path: 'myRadio', newValue: 'sweden' }),
    );
  });

  it('should not call handleDataChange when simpleBinding is set and preselectedOptionIndex', async () => {
    const { formDataMethods } = await render({
      component: {
        preselectedOptionIndex: 0,
      },
      formData: 'denmark',
      options: threeOptions,
    });

    expect(await findRadio({ name: 'Sweden' })).toBeInTheDocument();
    expect(getRadio({ name: 'Denmark', isChecked: true })).toBeInTheDocument();

    expect(formDataMethods.setLeafValue).not.toHaveBeenCalled();
  });

  it('should not set any as selected when no binding and no preselectedOptionIndex is set', async () => {
    const { formDataMethods } = await render({
      options: threeOptions,
    });

    await waitFor(() => expect(getRadio({ name: 'Norway' })).toBeInTheDocument());
    expect(getRadio({ name: 'Sweden' })).toBeInTheDocument();
    expect(getRadio({ name: 'Denmark' })).toBeInTheDocument();

    expect(formDataMethods.setLeafValue).not.toHaveBeenCalled();
  });

  it('should call handleDataChange with updated value when selection changes', async () => {
    const { formDataMethods } = await render({
      options: threeOptions,
      formData: 'norway',
    });

    await waitFor(() => {
      expect(screen.queryByTestId('altinn-spinner')).not.toBeInTheDocument();
    });

    expect(await findRadio({ name: 'Norway', isChecked: true })).toBeInTheDocument();
    expect(getRadio({ name: 'Sweden' })).toBeInTheDocument();

    expect(formDataMethods.setLeafValue).not.toHaveBeenCalled();

    const denmark = await waitFor(() => getRadio({ name: 'Denmark' }));
    expect(denmark).toBeInTheDocument();
    await userEvent.click(denmark);

    await waitFor(() =>
      expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({ path: 'myRadio', newValue: 'denmark' }),
    );
  });

  it('should call handleDataChange instantly on blur when the value has changed', async () => {
    const { formDataMethods } = await render({
      options: threeOptions,
      formData: 'norway',
    });

    const denmark = await waitFor(() => getRadio({ name: 'Denmark' }));

    expect(denmark).toBeInTheDocument();

    expect(formDataMethods.setLeafValue).not.toHaveBeenCalled();
    await userEvent.click(denmark);
    await userEvent.tab();
    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({ path: 'myRadio', newValue: 'denmark' });
  });

  it('should not call handleDataChange on blur when the value is unchanged', async () => {
    const { formDataMethods } = await render({
      options: threeOptions,
    });

    await waitFor(() => expect(getRadio({ name: 'Denmark' })).toBeInTheDocument());

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.focus(getRadio({ name: 'Denmark' }));
      fireEvent.blur(getRadio({ name: 'Denmark' }));
    });

    expect(formDataMethods.setLeafValue).not.toHaveBeenCalled();
  });

  it('should present replaced label, description and help text if setup with values from repeating group in redux and trigger handleDataChanged with replaced values', async () => {
    const { formDataMethods } = await render({
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
    });

    await waitFor(() => expect(getRadio({ name: /The value from the group is: Label for first/ })).toBeInTheDocument());
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

    expect(formDataMethods).not.toHaveBeenCalled();
    await userEvent.click(getRadio({ name: /The value from the group is: Label for first/ }));
    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({ path: 'myRadio', newValue: 'Value for first' });
  });

  it('should present the options list in the order it is provided when sortOrder is not specified', async () => {
    await render({
      component: {
        optionsId: 'countries',
      },
      options: threeOptions,
    });

    const options = await screen.findAllByRole('radio');

    expect(options[0].getAttribute('value')).toBe('norway');
    expect(options[1].getAttribute('value')).toBe('sweden');
    expect(options[2].getAttribute('value')).toBe('denmark');
  });

  it('should present the provided options list sorted alphabetically in ascending order when providing sortOrder "asc"', async () => {
    await render({
      component: {
        optionsId: 'countries',
        sortOrder: 'asc',
      },
      options: threeOptions,
    });

    const options = await screen.findAllByRole('radio');

    expect(options[0].getAttribute('value')).toBe('denmark');
    expect(options[1].getAttribute('value')).toBe('norway');
    expect(options[2].getAttribute('value')).toBe('sweden');
  });

  it('should present the provided options list sorted alphabetically in descending order when providing sortOrder "desc"', async () => {
    await render({
      component: {
        optionsId: 'countries',
        sortOrder: 'desc',
      },
      options: threeOptions,
    });

    const options = await screen.findAllByRole('radio');

    expect(options[0].getAttribute('value')).toBe('sweden');
    expect(options[1].getAttribute('value')).toBe('norway');
    expect(options[2].getAttribute('value')).toBe('denmark');
  });
});
