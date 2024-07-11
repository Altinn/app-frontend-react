import React from 'react';

import { screen } from '@testing-library/react';

import { getApplicationMetadataMock } from 'src/__mocks__/getApplicationMetadataMock';
import { OrganisationLogo } from 'src/components/presentation/OrganisationLogo/OrganisationLogo';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import type { ApplicationMetadata } from 'src/features/applicationMetadata/types';

const render = async (logo: ApplicationMetadata['logoOptions']) =>
  await renderWithInstanceAndLayout({
    renderer: () => <OrganisationLogo />,
    queries: {
      fetchApplicationMetadata: () => Promise.resolve(getApplicationMetadataMock({ logoOptions: logo })),
    },
  });

describe('OrganisationLogo', () => {
  it('Should get img src from organisations when logo.source is set to "org" in applicationMetadata', async () => {
    await render({
      source: 'org',
      displayAppOwnerNameInHeader: false,
    });
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://altinncdn.no/orgs/mockOrg/mockOrg.png');
  });

  it('Should not display appOwner when "showAppOwner" is set to false', async () => {
    await render({
      source: 'org',
      displayAppOwnerNameInHeader: false,
    });

    expect(screen.queryByText('Mockdepartementet')).not.toBeInTheDocument();
  });

  it('Should display appOwner when "showAppOwner" is set to true', async () => {
    await render({
      source: 'org',
      displayAppOwnerNameInHeader: true,
    });

    expect(await screen.findByText('Mockdepartementet')).toBeInTheDocument();
  });
});
