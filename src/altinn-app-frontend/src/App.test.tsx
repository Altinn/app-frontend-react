import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../testUtils';
import { App } from 'src/App';
import { MemoryRouter } from 'react-router-dom';

const render = ({ locationPath }: { locationPath: string }) => {
  renderWithProviders(
    <MemoryRouter initialEntries={[locationPath]}>
      <App />
    </MemoryRouter>,
  );
};

describe('App', () => {
  it('should get instance id from route', () => {
    render({
      locationPath:
        'org/app/instance/123456/75154373-aed4-41f7-95b4-e5b5115c2edc/some/function',
    });
    expect(
      screen.getByText(/not ready, but got instanceid\./i),
    ).toBeInTheDocument();
  });
  it('should not get instance if from route if it is invalid', () => {
    render({
      locationPath:
        'org/app/instance/123456/75154373-aed4-41f7-95b4-e5b51INVALID/some/function',
    });
    expect(screen.queryByText(/not ready, but got instanceid\./i)).toBeNull();
  });
});
