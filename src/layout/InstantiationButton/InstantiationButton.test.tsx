import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { getInstanceDataMock } from 'src/__mocks__/instanceDataStateMock';
import { InstantiationButtonComponent } from 'src/layout/InstantiationButton/InstantiationButtonComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';

const render = async () =>
  await renderGenericComponentTest({
    type: 'InstantiationButton',
    component: {
      textResourceBindings: {
        title: 'Instantiate',
      },
    },
    inInstance: false,
    router: ({ children }) => (
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path={'/'}
            element={children}
          />
          <Route
            path='/instance/abc123'
            element={<span>You are now looking at the instance</span>}
          />
        </Routes>
      </MemoryRouter>
    ),
    renderer: (props) => <InstantiationButtonComponent {...props} />,
  });

describe('InstantiationButton', () => {
  it('should show button and it should be possible to click and start loading', async () => {
    const { mutations } = await render();
    expect(screen.getByText('Instantiate')).toBeInTheDocument();

    expect(screen.queryByText('Laster innhold')).toBeNull();

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Laster innhold')).toBeInTheDocument();

    expect(mutations.doInstantiate.mock).toHaveBeenCalledTimes(1);

    mutations.doInstantiate.resolve({
      ...getInstanceDataMock(),
      id: 'abc123',
    });

    expect(screen.getByText('You are now looking at the instance')).toBeInTheDocument();
  });
});
