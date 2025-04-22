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
  org?: TenorOrg;
};

// Common Tenor users and organizations
export const tenorOrg: TenorOrg = {
  name: 'Sivilisert Avansert Isbjørn AS',
  orgNr: '312405091',
};

export const tenorUsers: Record<string, TenorUser> = {
  humanAndrefiolin: {
    name: 'Human Andrefiolin',
    ssn: '09876298713',
    role: 'CEO',
    org: tenorOrg,
  },
  varsomDiameter: {
    name: 'Varsom Diameter',
    ssn: '03835698199',
    role: 'Chairman',
    org: tenorOrg,
  },
  standhaftigBjornunge: {
    name: 'Standhaftig Bjørnunge',
    ssn: '23849199013',
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
