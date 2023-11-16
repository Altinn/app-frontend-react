import React from 'react';

import { screen } from '@testing-library/react';

import { organisationMock } from 'src/__mocks__/organisationMock';
import { getProfileStateMock } from 'src/__mocks__/profileStateMock';
import { AltinnAppHeader } from 'src/components/AltinnAppHeader';
import { renderWithoutInstanceAndLayout } from 'src/test/renderWithProviders';
import type { IHeaderProps } from 'src/components/AltinnAppHeader';

describe('AltinnAppHeader', () => {
  it('should show organisation name when profile has party, and party has organisation with name, and "type" is not set', async () => {
    const profile = getProfileStateMock();
    if (profile.profile.party) {
      profile.profile.party.organization = organisationMock;
    }

    await render({
      profile: profile.profile,
      type: undefined,
    });

    expect(screen.getByText(`for ${organisationMock.name.toUpperCase()}`)).toBeInTheDocument();
  });

  it('should not show organisation name when profile has party, and party has organisation with name, and "type" is set', async () => {
    const profile = getProfileStateMock();
    if (profile.profile.party) {
      profile.profile.party.organization = organisationMock;
    }

    await render({
      profile: profile.profile,
      type: 'partyChoice',
    });

    expect(screen.queryByText(`for ${organisationMock.name.toUpperCase()}`)).not.toBeInTheDocument();
  });

  it('should render links to inbox, schemas and profile when "type" is set and profile has "party" property', async () => {
    const profile = getProfileStateMock();
    await render({
      profile: profile.profile,
      type: 'partyChoice',
    });

    expect(screen.getByRole('link', { name: /innboks/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /alle skjema/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profil/i })).toBeInTheDocument();
  });

  it('should not render links to inbox, schemas and profile when "type" is not set', async () => {
    await render({ type: undefined });

    expect(screen.queryByRole('link', { name: /innboks/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /alle skjema/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /profil/i })).not.toBeInTheDocument();
  });

  it('should not render links to inbox, schemas and profile when "type" is set but profile does not have "party" property', async () => {
    const profile = getProfileStateMock();
    delete profile.profile.party;
    await render({
      profile: profile.profile,
      type: 'partyChoice',
    });

    expect(screen.queryByRole('link', { name: /innboks/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /alle skjema/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /profil/i })).not.toBeInTheDocument();
  });
});

const render = async (props: Partial<IHeaderProps> = {}) => {
  const profile = getProfileStateMock();

  const allProps = {
    profile: profile.profile,
    ...props,
  };

  await renderWithoutInstanceAndLayout({
    renderer: () => <AltinnAppHeader {...allProps} />,
  });
};
