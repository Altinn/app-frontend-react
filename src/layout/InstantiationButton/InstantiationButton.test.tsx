import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { getInstanceDataMock } from 'src/__mocks__/getInstanceDataMock';
import { ValidPartyProvider } from 'src/features/party/ValidPartyProvider';
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
            element={<ValidPartyProvider>{children}</ValidPartyProvider>}
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

    await waitFor(() => {
      expect(mutations.doPartyValidation.mock).toHaveBeenCalledTimes(1);
    });

    mutations.doPartyValidation.resolve({
      valid: true,
      message: null,
      validParties: [],
    });

    expect(screen.getByText('Instantiate')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Laster innhold')).toBeInTheDocument();

    expect(mutations.doInstantiateWithPrefill.mock).toHaveBeenCalledTimes(1);

    mutations.doInstantiateWithPrefill.resolve({
      ...getInstanceDataMock(),
      id: 'abc123',
    });

    await waitFor(() => {
      expect(screen.getByText('You are now looking at the instance')).toBeInTheDocument();
    });
  });
});
