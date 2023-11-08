import React from 'react';

import { screen } from '@testing-library/react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { renderWithoutInstanceAndLayout } from 'src/test/renderWithProviders';

describe('tests to make sure to follow accessibility requirements', () => {
  test('should have role progressbar', () => {
    renderWithoutInstanceAndLayout({ renderer: () => <AltinnSpinner /> });
    expect(screen.getByRole('progressbar'));
  });

  test('should have role alert on spinner text to make sure screen readers is focus the text content', () => {
    renderWithoutInstanceAndLayout({
      renderer: () => <AltinnSpinner spinnerText={'Loading form'} />,
    });
    const spinnerText = screen.getByRole('alert');

    expect(spinnerText).toHaveTextContent('Loading form');
    expect(spinnerText).toHaveAttribute('aria-busy', 'true');
    expect(spinnerText).toHaveTextContent('Loading form');
  });

  test('should fallback spinnerText to "Laster innhold", but hidden from visual view to stay accessible"', () => {
    renderWithoutInstanceAndLayout({ renderer: () => <AltinnSpinner /> });
    const spinnerText = screen.getByLabelText('Laster innhold');
    expect(spinnerText).toBeInTheDocument();
    expect(spinnerText).toHaveTextContent('');
  });
});
