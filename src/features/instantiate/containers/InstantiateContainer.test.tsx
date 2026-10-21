import React from 'react';

import { jest } from '@jest/globals';
import { screen, waitFor } from '@testing-library/react';

import { InstantiateContainer } from 'src/features/instantiate/containers/InstantiateContainer';
import { renderWithoutInstanceAndLayout } from 'src/test/renderWithProviders';

describe('InstantiateContainer', () => {
  it('should show that the service cannot be started when instantiation responds with 410', async () => {
    jest.spyOn(window, 'logError').mockImplementation(() => {});
    const { mutations } = await renderWithoutInstanceAndLayout({
      renderer: () => <InstantiateContainer />,
      waitUntilLoaded: false,
    });

    await waitFor(() => expect(mutations.doInstantiate.mock).toHaveBeenCalledTimes(1));
    mutations.doInstantiate.reject(Object.assign(new Error('Gone'), { isAxiosError: true, response: { status: 410 } }));

    expect(await screen.findByText('Du kan ikke starte denne tjenesten')).toBeInTheDocument();
    expect(screen.getByTestId('StatusCode')).toHaveTextContent('Feil 410');
    expect(screen.queryByText(/du mangler rettigheter/i)).not.toBeInTheDocument();
  });
});
