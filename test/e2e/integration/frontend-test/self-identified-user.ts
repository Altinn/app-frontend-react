import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Self identified user', () => {
  it('should be able to log in and create an instance (without fetching party list or current party)', () => {
    cy.intercept('**/active', []).as('noActiveInstances');
    cy.startAppInstance(appFrontend.apps.frontendTest, { user: 'selfIdentified', authenticationLevel: '0' });

    cy.get(appFrontend.closeButton).should('be.visible');
    cy.findByRole('heading', { name: /Appen for test av app frontend/i }).should('exist');

    cy.assertUser('selfIdentified');
  });
});
