import React from 'react';

import { jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { renderWithMinimalProviders } from 'src/test/renderWithProviders';

// Need to unmock axios to get actual implementation of isAxiosError
jest.unmock('axios');

describe('Unknown error', () => {
  it('should be able to render with minimal providers', async () => {
    const user = userEvent.setup({ delay: null });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await renderWithMinimalProviders({
      renderer: () => <UnknownError error={new Error('Error test message')} />,
    });

    expect(screen.getByTestId('StatusCode')).toBeInTheDocument();
    expect(screen.getByTestId('StatusCode')).toHaveTextContent('Ukjent feil');
    expect(screen.getByTestId('AltinnError')).toHaveTextContent(
      'Det har skjedd en ukjent feil, vennligst prøv igjen senere.',
    );

    expect(console.error).not.toHaveBeenCalled();

    const showDetailsButton = screen.getByRole('button', { name: 'Vis detaljer om feilen' });
    await user.click(showDetailsButton);
    expect(screen.getByText('Error test message')).toBeInTheDocument();
  });
});
