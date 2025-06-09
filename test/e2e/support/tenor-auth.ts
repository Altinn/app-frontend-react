import type { TenorUser } from 'test/e2e/support/auth';

import type { IncomingApplicationMetadata } from 'src/features/applicationMetadata/types';

export function reverseName(name: string): string {
  return name.split(' ').reverse().join(' ');
}

function performTenorLogin(appName: string, user: TenorUser) {
  cy.visit(`https://ttd.apps.${Cypress.config('baseUrl')?.slice(8)}/ttd/${appName}`);

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
}

export function performLocalLogin(user: TenorUser) {
  cy.visit(`${Cypress.config('baseUrl')}`);
  cy.findByRole('combobox', { name: /select test users/i })
    .should('exist')
    .find('option')
    .contains(new RegExp(user.name, 'i'))
    .then(($option) => {
      cy.get('select#UserSelect').select($option.val() as string);
    });

  cy.findByRole('button', {
    name: /proceed to app/i,
  }).click();
}

export function tenorLogin(appName: string, user: TenorUser) {
  // Visit the app without any user
  cy.intercept<object, IncomingApplicationMetadata>('**/api/v1/applicationmetadata', (req) => {
    req.reply((res) => {
      const body = res.body as IncomingApplicationMetadata;

      res.headers['cache-control'] = 'no-store';
      body.promptForParty = 'never';
    });
  }).as('applicationMetadata');
  cy.clearCookies();

  if (Cypress.env('type') === 'localtest') {
    performLocalLogin(user);
  } else {
    performTenorLogin(appName, user);
  }

  cy.reloadAndWait();
}
