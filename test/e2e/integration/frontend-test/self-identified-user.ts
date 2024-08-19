import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Self identified user', () => {
  it('should be able to log in and create an instance (without fetching party list or current party)', () => {
    cy.intercept('**/active', []).as('noActiveInstances');
    cy.intercept('POST', `**/instances?instanceOwnerPartyId*`).as('instantiate');
    cy.intercept('GET', `**/api/authorization/parties/current?returnPartyObject=true`, { statusCode: 403 }).as(
      'currentParty',
    );
    cy.intercept('GET', `**/api/v1/parties?allowedtoinstantiatefilter=true`, { statusCode: 403 }).as('partyList');

    cy.startAppInstance(appFrontend.apps.frontendTest, { user: 'selfIdentified', authenticationLevel: '0' });

    cy.get(appFrontend.closeButton).should('be.visible');
    cy.findByRole('heading', { name: /Appen for test av app frontend/i }).should('exist');

    cy.assertUser('selfIdentified');

    // In production modes trying to fetch these requests would fail, so we make sure no code paths here lead to us
    // trying to fetch them.
    cy.get('@currentParty.all').should('have.length', 0);
    cy.get('@partyList.all').should('have.length', 0);
  });
});
