import type { StartAppInstanceOptions } from 'test/e2e/support/global';

// Types
export type TenorOrg = {
  name: string;
  orgNr: string;
};

export type TenorUser = {
  name: string;
  ssn: string;
  role?: string;
  orgs?: CyTenorOrg[];
};

type CyTenorOrg = 'Sivilisert Avansert Isbjørn AS' | 'Tilbakeholden Upopulær Tiger AS' | 'Offisiell Virtuell Tiger AS';

// Common Tenor users and organizations
export const tenorOrgs: { [K in CyTenorOrg]: TenorOrg } = {
  'Sivilisert Avansert Isbjørn AS': {
    name: 'Sivilisert Avansert Isbjørn AS',
    orgNr: '312405091',
  },
  'Tilbakeholden Upopulær Tiger AS': {
    name: 'Tilbakeholden Upopulær Tiger AS',
    orgNr: '314307577',
  },
  'Offisiell Virtuell Tiger AS': {
    name: 'Offisiell Virtuell Tiger AS',
    orgNr: '314277961',
  },
};

export const tenorUsers: Record<string, TenorUser> = {
  humanAndrefiolin: {
    name: 'Human Andrefiolin',
    ssn: '09876298713',
    role: 'CEO',
    orgs: ['Sivilisert Avansert Isbjørn AS'],
  },
  varsomDiameter: {
    name: 'Varsom Diameter',
    ssn: '03835698199',
    role: 'Chairman',
    orgs: ['Sivilisert Avansert Isbjørn AS'],
  },
  standhaftigBjornunge: {
    name: 'Standhaftig Bjørnunge',
    ssn: '23849199013',
  },
  snaalDugnad: {
    name: 'Snål Dugnad',
    ssn: '10928198958',
    orgs: ['Tilbakeholden Upopulær Tiger AS', 'Offisiell Virtuell Tiger AS'],
  },
};

export function reverseName(name: string): string {
  return name.split(' ').reverse().join(' ');
}

function performTenorLogin(user: TenorUser) {
  cy.findByRole('link', {
    name: /testid lag din egen testbruker/i,
  }).click();

  cy.findByRole('textbox', {
    name: /personidentifikator \(syntetisk\)/i,
  }).type(user.ssn);

  cy.findByRole('button', {
    name: /autentiser/i,
  }).click();

  cy.findByText(new RegExp(reverseName(user.name), 'i')).click();
  cy.waitForLoad();

  cy.findByText(new RegExp(reverseName(user.name), 'i')).click();
}

export function tenorLogin(
  appName: string,
  user: TenorUser,
  options?: Partial<Omit<StartAppInstanceOptions, 'user' | 'tenorUser'>>,
) {
  // Visit the app without any user
  cy.clearCookies();
  const targetUrl =
    Cypress.env('type') === 'localtest'
      ? `${Cypress.config('baseUrl')}/ttd/${appName}${options?.urlSuffix || ''}`
      : `https://ttd.apps.${Cypress.config('baseUrl')?.slice(8)}/ttd/${appName}${options?.urlSuffix || ''}`;

  cy.visit(targetUrl);

  // Perform the Tenor login
  performTenorLogin(user);
}
