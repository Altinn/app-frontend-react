import React from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TextAreaComponent } from 'src/layout/TextArea/TextAreaComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { FDAction } from 'src/features/formData/StateMachine';
import type { RenderGenericComponentTestProps } from 'src/test/renderWithProviders';

describe('TextAreaComponent', () => {
  it('should render with initial text value', async () => {
    await render({
      queries: {
        fetchFormData: async () => ({
          myTextArea: 'initial text content',
        }),
      },
    });

    const textarea = screen.getByRole('textbox');

    expect(textarea).toHaveValue('initial text content');
  });

  it('should fire handleDataChange with value when textarea is blurred', async () => {
    const initialText = 'initial text content';
    const addedText = ' + added content';

    const { dispatchFormData } = await render({
      queries: {
        fetchFormData: async () => ({
          myTextArea: initialText,
        }),
      },
    });

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, addedText);
    await userEvent.tab();

    expect(dispatchFormData).toHaveBeenCalledWith({
      type: 'setLeafValue',
      path: 'myTextArea',
      newValue: `${initialText}${addedText}`,
    } as FDAction);
  });

  it('should not fire handleDataChange when readOnly is true', async () => {
    const initialText = 'initial text content';
    const addedText = ' + added content';

    const { dispatchFormData } = await render({
      component: {
        readOnly: true,
      },
      queries: {
        fetchFormData: async () => ({
          myTextArea: initialText,
        }),
      },
    });

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, addedText);

    expect(dispatchFormData).not.toHaveBeenCalled();
  });

  it('should have aria-describedby attribute if textResourceBindings is present', async () => {
    await render({
      component: {
        id: 'id',
        textResourceBindings: {},
      },
    });

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-describedby', 'description-id');
  });

  it('should not have aria-describedby attribute if textResourceBindings is not present', async () => {
    await render();

    const textarea = screen.getByRole('textbox');
    expect(textarea).not.toHaveAttribute('aria-describedby');
  });
});

const render = async ({
  component,
  genericProps,
  ...rest
}: Partial<RenderGenericComponentTestProps<'TextArea'>> = {}) =>
  await renderGenericComponentTest({
    type: 'TextArea',
    renderer: (props) => <TextAreaComponent {...props} />,
    component: {
      dataModelBindings: {
        simpleBinding: 'myTextArea',
      },
      ...component,
    },
    genericProps,
    ...rest,
  });
