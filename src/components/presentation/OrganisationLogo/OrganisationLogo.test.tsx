import React from 'react';

import { screen } from '@testing-library/react';

import { getApplicationMetadataMock } from 'src/__mocks__/getApplicationMetadataMock';
import { OrganisationLogo } from 'src/components/presentation/OrganisationLogo/OrganisationLogo';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type * as queries from 'src/queries/queries';
import type { KeysStartingWith } from 'src/queries/types';

const render = async ({
  logo,
  queriesOverride,
}: {
  logo: IApplicationMetadata['logo'];
  queriesOverride?: Partial<KeysStartingWith<typeof queries, 'fetch'>>;
}) =>
  await renderWithInstanceAndLayout({
    renderer: () => <OrganisationLogo />,
    queries: {
      fetchApplicationMetadata: () => Promise.resolve(getApplicationMetadataMock({ logo })),
      ...queriesOverride,
    },
  });

describe('OrganisationLogo', () => {
  it('Should get img src from organisations when logo.source is set to "org" in applicationMetadata', async () => {
    const logo = { source: 'org', displayAppOwnerNameInHeader: true } satisfies IApplicationMetadata['logo'];
    await render({ logo });

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://altinncdn.no/orgs/mockOrg/mockOrg.png');
  });

  it('Should not display appOwner when "showAppOwner" is set to false', async () => {
    const logo = { source: 'org', displayAppOwnerNameInHeader: false } satisfies IApplicationMetadata['logo'];
    await render({ logo });

    expect(screen.queryByText('Mockdepartementet')).not.toBeInTheDocument();
  });

  it('Should display appOwner when "showAppOwner" is set to true', async () => {
    const logo = { source: 'org', displayAppOwnerNameInHeader: true } satisfies IApplicationMetadata['logo'];
    await render({ logo });

    expect(await screen.findByText('Mockdepartementet')).toBeInTheDocument();
  });

  test('Should render unknown error when fetchOrgs returns error', async () => {
    const logo = { source: 'org' } satisfies IApplicationMetadata['logo'];

    await render({
      logo,
      queriesOverride: {
        fetchOrgs: async () => {
          throw new Error('400 Bad Request');
        },
      },
    });

    await screen.findByRole('heading', { level: 1, name: 'Ukjent feil' });
    expect(screen.getByRole('heading', { level: 1, name: 'Ukjent feil' })).toBeInTheDocument();
  });
});
