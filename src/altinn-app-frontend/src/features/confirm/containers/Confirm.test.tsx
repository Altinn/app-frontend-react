import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { screen } from '@testing-library/react';
import { renderWithProviders } from 'testUtils';

import { Confirm } from 'src/features/confirm/containers/Confirm';

describe('Confirm', () => {
  it('should show spinner when loading required data', () => {
    renderWithProviders(
      <MemoryRouter>
        <Confirm />
      </MemoryRouter>,
    );
    const title = screen.queryByText('Se over svarene dine før du sender inn');
    expect(title).not.toBeInTheDocument();

    const contentLoader = screen.getByText('Loading...');
    expect(contentLoader).toBeInTheDocument();
  });
});
