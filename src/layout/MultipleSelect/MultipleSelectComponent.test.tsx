import React from 'react';

import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { MultipleSelectComponent } from 'src/layout/MultipleSelect/MultipleSelectComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { FDAction } from 'src/features/formData/FormDataWriteStateMachine';
import type { RenderGenericComponentTestProps } from 'src/test/renderWithProviders';

const dummyLabel = 'dummyLabel';

const render = async ({
  component,
  genericProps,
  ...rest
}: Partial<RenderGenericComponentTestProps<'MultipleSelect'>> = {}) =>
  await renderGenericComponentTest({
    type: 'MultipleSelect',
    renderer: (props) => (
      <>
        <label htmlFor={props.node.item.id}>{dummyLabel}</label>
        <MultipleSelectComponent {...props} />
      </>
    ),
    component: {
      dataModelBindings: { simpleBinding: 'someField' },
      options: [
        { value: 'value1', label: 'label1' },
        { value: 'value2', label: 'label2' },
        { value: 'value3', label: 'label3' },
      ],
      readOnly: false,
      required: false,
      textResourceBindings: {},
      ...component,
    },
    genericProps: {
      isValid: true,
      ...genericProps,
    },
    ...rest,
  });

describe('MultipleSelect', () => {
  it('should display correct options as selected when supplied with a comma separated form data', async () => {
    await render({
      queries: {
        fetchFormData: async () => ({ someField: 'value1,value3' }),
      },
    });
    const input = screen.getByTestId('InputWrapper');
    expect(within(input).getByText('label1')).toBeInTheDocument();
    expect(within(input).queryByText('label2')).not.toBeInTheDocument();
    expect(within(input).getByText('label3')).toBeInTheDocument();
  });

  it('should remove item from comma separated form data on delete', async () => {
    const { dispatchFormData } = await render({
      queries: {
        fetchFormData: async () => ({ someField: 'value1,value2,value3' }),
      },
    });

    await userEvent.click(screen.getByRole('button', { name: /Slett label2/i }));

    expect(dispatchFormData).toHaveBeenCalledWith({
      type: 'setLeafValue',
      path: 'someField',
      newValue: 'value1,value3',
    } as FDAction);
  });
});
