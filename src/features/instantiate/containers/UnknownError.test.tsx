import React from 'react';

import { screen } from '@testing-library/react';

import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { renderWithMinimalProviders } from 'src/test/renderWithProviders';

describe('Unknown error', () => {
  it('should be able to render with minimal providers', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await renderWithMinimalProviders({
      renderer: () => <UnknownError />,
    });

    expect(screen.getByTestId('StatusCode')).toBeInTheDocument();
    expect(screen.getByTestId('StatusCode')).toHaveTextContent('Ukjent feil');
    expect(screen.getByTestId('AltinnError')).toHaveTextContent(
      'Det har skjedd en ukjent feil, vennligst prøv igjen senere.',
    );
    // Parameters doesn't work when no providers are present
    expect(screen.getByTestId('AltinnError')).toHaveTextContent(
      'Om problemet vedvarer, ta kontakt med oss på brukerservice {0}.',
    );

    const calls = (console.error as jest.Mock).mock.calls;
    const otherCalls = callsExceptWhereErrorBoundaryIsWorking(calls);

    expect(otherCalls).toEqual([]);
  });
});

function callsExceptWhereErrorBoundaryIsWorking(calls: any[]) {
  const otherCalls: any[] = [];
  for (const call of calls) {
    if (
      typeof call[0] === 'object' &&
      call[0] &&
      'message' in call[0] &&
      call[0].message.includes('Language is missing')
    ) {
      continue;
    }
    if (
      typeof call[0] === 'string' &&
      call[0].includes('The above error occurred in the <LangComponent> component') &&
      call[0].includes(
        'React will try to recreate this component tree from scratch using the error boundary you provided, Lang',
      )
    ) {
      continue;
    }
    otherCalls.push(call);
  }

  return otherCalls;
}
