/// <reference types='cypress' />
/// <reference types="../../support" />

import AppFrontend from '../../pageobjects/app-frontend';
import * as texts from '../../fixtures/texts.json';

const appFrontend = new AppFrontend();

describe('Receipt', () => {
  it('is possible to view simple receipt when auto delete is true', () => {
    cy.intercept('**/api/layoutsettings/stateless').as('getLayoutStateless');
    cy.startAppInstance(Cypress.env('stateless'));
    cy.wait('@getLayoutStateless');
    cy.startStateFullFromStateless();
    cy.intercept('PUT', '**/process/next').as('nextProcess');
    cy.get(appFrontend.sendinButton).should('be.visible').click();
    cy.wait('@nextProcess').its('response.statusCode').should('eq', 200);
    cy.url().then((url) => {
      const instanceId = /[0-9]+\/*[0-f]{8}-[0-f]{4}-[1-5][0-f]{3}-[89ab][0-f]{3}-[0-f]{12}$/i.exec(url);
      let requestUrl =
        Cypress.env('environment') === 'local'
          ? `${Cypress.env('baseUrl')}`
          : `https://ttd.apps.${Cypress.config('baseUrl').slice(8)}`;
      requestUrl += `/ttd/${Cypress.env('stateless')}/instances/${instanceId}/process/next`;
      cy.getCookie('XSRF-TOKEN').then((xsrfToken) => {
        cy.request({
          method: 'PUT',
          url: requestUrl,
          headers: {
            'X-XSRF-TOKEN': xsrfToken.value,
          },
        })
          .its('status')
          .should('eq', 200);
      });
      cy.get(appFrontend.receipt.container).should('contain.text', texts.securityReasons);
    });
  });
});
