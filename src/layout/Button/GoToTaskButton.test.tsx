import React from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { ButtonComponent } from 'src/layout/Button/ButtonComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { RenderGenericComponentTestProps } from 'src/test/renderWithProviders';

const render = async ({ component, genericProps }: Partial<RenderGenericComponentTestProps<'Button'>> = {}) => {
  const { store } = await renderGenericComponentTest({
    type: 'Button',
    renderer: (props) => <ButtonComponent {...props} />,
    component: {
      mode: 'go-to-task',
      textResourceBindings: {
        title: 'Go to task',
      },
      ...component,
    },
    genericProps,
    queries: {
      fetchProcessNextSteps: () => Promise.resolve(['a', 'b']),
    },
  });

  return store.dispatch as jest.Mock;
};

describe('GoToTaskButton', () => {
  it('should show button and it should be possible to click', async () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const dispatch = await render({
      component: {
        taskId: 'a',
      },
    });
    expect(screen.getByText('Go to task')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(dispatch).toHaveBeenCalled();
  });
  it('should show button and it should not be possible to click', async () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const dispatch = await render({
      component: {
        taskId: 'c',
      },
    });
    expect(screen.getByText('Go to task')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    await userEvent.click(screen.getByRole('button'));
    expect(dispatch).not.toHaveBeenCalled();
  });
});
