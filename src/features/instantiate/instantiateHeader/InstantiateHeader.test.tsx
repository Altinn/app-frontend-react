import React from 'react';

import { jest } from '@jest/globals';
import { screen } from '@testing-library/react';

import { getPartyMock, getPartyWithSubunitMock } from 'src/__mocks__/getPartyMock';
import { InstantiateHeader } from 'src/features/instantiate/instantiateHeader/InstantiateHeader';
import { useSelectedParty } from 'src/features/party/PartiesProvider';
import { renderWithoutInstanceAndLayout } from 'src/test/renderWithProviders';

jest.mock('src/features/party/PartiesProvider', () => ({
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  ...jest.requireActual<typeof import('src/features/party/PartiesProvider')>('src/features/party/PartiesProvider'),
  useSelectedParty: jest.fn(),
}));

describe('InstantiateHeader', () => {
  it('should not show organisation name when profile has party, and party has organisation with name', async () => {
    const org = getPartyWithSubunitMock().org;
    jest.mocked(useSelectedParty).mockReturnValue(org);

    await render();

    expect(screen.queryByText(`for ${org.name.toUpperCase()}`)).not.toBeInTheDocument();
  });

  it('should render links to inbox, schemas and profile when selectedParty is defined', async () => {
    jest.mocked(useSelectedParty).mockReturnValue(getPartyMock());
    await render();

    expect(screen.getByRole('link', { name: /innboks/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /alle skjema/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profil/i })).toBeInTheDocument();
  });

  it('should not render links to inbox, schemas and profile when selectedParty is undefined', async () => {
    jest.mocked(useSelectedParty).mockReturnValue(undefined);
    await render();

    expect(screen.queryByRole('link', { name: /innboks/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /alle skjema/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /profil/i })).not.toBeInTheDocument();
  });
});

const render = async () => {
  await renderWithoutInstanceAndLayout({
    renderer: () => <InstantiateHeader />,
  });
};
