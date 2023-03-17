import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

import type { IBackendFeaturesState } from 'src/shared/resources/applicationMetadata';

const appFrontend = new AppFrontend();

describe('Double signing', () => {
  beforeEach(() => {
    cy.intercept('**/active', []).as('noActiveInstances');
    cy.intercept('POST', `**/instances?instanceOwnerPartyId*`).as('createInstance');
    cy.intercept('GET', '**/applicationmetadata', (req) => {
      req.on('response', (res) => {
        res.body.features = {
          actionPermissions: true,
        } as IBackendFeaturesState;
      });
    }).as('applicationMetadata');
  });

  it('accountant -> manager -> auditor', () => {
    cy.interceptPermissions('rw');
    cy.startAppInstance(appFrontend.apps.signingTest, 'accountant');
    cy.assertUser('accountant');
    cy.get(appFrontend.signingTest.incomeField).type('4567');

    cy.interceptPermissions('r');
    cy.get(appFrontend.signingTest.submitButton).should('not.be.disabled').click();
    cy.get(appFrontend.signingTest.managerConfirmPanel).should('exist').and('be.visible');
    cy.get(appFrontend.signingTest.confirmButton).should('be.disabled');

    cy.interceptPermissions('rc');
    cy.switchUser('manager');
    cy.assertUser('manager');
    cy.get(appFrontend.signingTest.incomeField).should('contain.value', '4 567 000 NOK');

    cy.interceptPermissions('r');
    cy.get(appFrontend.signingTest.confirmButton).should('not.be.disabled').click();
    cy.get(appFrontend.signingTest.auditorConfirmPanel).should('exist').and('be.visible');
    cy.get(appFrontend.signingTest.confirmButton).should('be.disabled');

    cy.interceptPermissions('rc');
    cy.switchUser('auditor');
    cy.assertUser('auditor');

    cy.get(appFrontend.signingTest.incomeField).should('contain.value', '4 567 000 NOK');
    cy.get(appFrontend.signingTest.confirmButton).should('not.be.disabled').click();
    cy.get(appFrontend.receipt.container).should('exist').and('be.visible');
  });

  it('manager -> manager -> auditor', () => {
    cy.interceptPermissions('rw');
    cy.startAppInstance(appFrontend.apps.signingTest, 'manager');
    cy.assertUser('manager');

    cy.get(appFrontend.signingTest.incomeField).type('4567');

    cy.interceptPermissions('rc');
    cy.get(appFrontend.signingTest.submitButton).should('not.be.disabled').click();
    cy.get(appFrontend.signingTest.managerConfirmPanel).should('exist').and('be.visible');
    cy.get(appFrontend.signingTest.incomeField).should('contain.value', '4 567 000 NOK');

    cy.interceptPermissions('r');
    cy.get(appFrontend.signingTest.confirmButton).should('not.be.disabled').click();
    cy.get(appFrontend.signingTest.auditorConfirmPanel).should('exist').and('be.visible');
    cy.get(appFrontend.signingTest.confirmButton).should('be.disabled');

    cy.interceptPermissions('rc');
    cy.switchUser('auditor');
    cy.assertUser('auditor');

    cy.get(appFrontend.signingTest.incomeField).should('contain.value', '4 567 000 NOK');
    cy.get(appFrontend.signingTest.confirmButton).should('not.be.disabled').click();
    cy.get(appFrontend.receipt.container).should('exist').and('be.visible');
  });
});
