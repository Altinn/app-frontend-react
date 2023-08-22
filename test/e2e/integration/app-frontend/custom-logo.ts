import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

import type { IApplicationMetadata } from 'src/features/applicationMetadata';

const appFrontend = new AppFrontend();

const interceptApplicationMetadata = (overrides: Partial<IApplicationMetadata> = {}): IApplicationMetadata => ({
  id: 'ttd/frontend-test',
  org: 'ttd',
  dataTypes: [],
  createdBy: 'test',
  lastChangedBy: 'test',
  created: '2021-09-09T12:00:00.000+00:00',
  lastChanged: '2021-09-09T12:00:00.000+00:00',
  autoDeleteOnProcessEnd: false,
  ...overrides,
  title: {
    nb: 'frontend-test',
    en: 'frontend-test ENGLISH',
    ...overrides.title,
  },
  onEntry: {
    show: 'select-instance',
    ...overrides.onEntry,
    instanceSelection: {
      sortDirection: 'desc',
      rowsPerPageOptions: [1, 2, 3],
      defaultSelectedOption: 1,
      ...(overrides.onEntry?.instanceSelection ?? {}),
    },
  },
  partyTypesAllowed: {
    bankruptcyEstate: false,
    organisation: false,
    person: true,
    subUnit: false,
    ...overrides.partyTypesAllowed,
  },
});

describe('Custom logo', () => {
  it('should display a custom logo if a custom logo is provided in resources', () => {
    cy.intercept('**/applicationmetadata', interceptApplicationMetadata());
    cy.startAppInstance(appFrontend.apps.frontendTest);

    cy.get('header');
    cy.findByAltText('Testdepartementet').should('be.visible');
  });
});
