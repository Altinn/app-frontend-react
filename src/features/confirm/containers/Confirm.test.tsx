import React from 'react';

import { screen } from '@testing-library/react';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { partyMock } from 'src/__mocks__/partyMock';
import { Confirm } from 'src/features/confirm/containers/Confirm';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';

describe('Confirm', () => {
  it('should not show loading if required data is loaded', async () => {
    await renderWithInstanceAndLayout({
      renderer: () => <Confirm />,
      reduxState: {
        ...getInitialStateMock(),
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
