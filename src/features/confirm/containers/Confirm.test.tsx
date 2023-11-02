import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { screen } from '@testing-library/react';

import { partyMock } from 'src/__mocks__/partyMock';
import { Confirm } from 'src/features/confirm/containers/Confirm';
import { renderWithProviders } from 'src/test/renderWithProviders';

describe('Confirm', () => {
  it('should not show loading if required data is loaded', async () => {
    await renderWithProviders({
      Router: MemoryRouter,
      component: <Confirm />,
      preloadedState: {
        party: {
          parties: [partyMock],
          selectedParty: partyMock,
          error: null,
        },
      },
    });
    const contentLoader = screen.queryByText('Loading...');
    expect(contentLoader).not.toBeInTheDocument();
  });
});
