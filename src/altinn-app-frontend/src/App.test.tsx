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
  const mockInstanceId = '123456/75154373-aed4-41f7-95b4-e5b5115c2edc';
  it('should get instance id form route', () => {
    render({
      locationPath: `org/app/instance/${mockInstanceId}/some/function`,
    });
    expect(screen.getByTestId(mockInstanceId)).toBeInTheDocument();
  });

  it('should not get instance id if form route if id is not formatted correctly', () => {
    render({
      locationPath:
        'org/app/instance/123456/75154373-aed4-41f7-95b4-e5b51INVALID/some/function',
    });
    expect(screen.queryByTestId(mockInstanceId)).toBeNull();
  });
});
