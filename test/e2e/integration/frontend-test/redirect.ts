import texts from 'test/e2e/fixtures/texts.json';
import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

import type { IncomingApplicationMetadata } from 'src/features/applicationMetadata/types';

const appFrontend = new AppFrontend();

describe('Redirect', () => {
  beforeEach(() => {
    cy.intercept('**/active', []).as('noActiveInstances');
  });

  it('User missing role to start the app is displayed', () => {
    cy.allowFailureOnEnd();
    cy.intercept('POST', `**/instances?instanceOwnerPartyId*`, {
      statusCode: 403,
    }).as('instantiate');
    cy.startAppInstance(appFrontend.apps.frontendTest);
    cy.get(appFrontend.instanceErrorCode).should('have.text', 'Feil 403');
    cy.get(appFrontend.altinnError).should('contain.text', texts.missingRights);

    // Verify that the mutation was only called once
    cy.get('@instantiate.all').should('have.length', 1);
  });

  it('User with too low authentication level is redirected to step-up authentication instead of the error page', () => {
    cy.allowFailureOnEnd();

    cy.intercept('GET', '**/api/v1/applicationmetadata', (req) => {
      req.on('response', (res) => {
        (res.body as IncomingApplicationMetadata).onEntry = { show: 'new-instance' };
      });
    });

    cy.intercept('POST', '**/instances**', {
      statusCode: 403,
      body: { RequiredAuthenticationLevel: 3 },
    }).as('instantiate');

    cy.intercept('PUT', '**/api/authentication/invalidatecookie', { statusCode: 200 }).as('invalidateCookie');

    // The step-up sets window.location.href, which would put Cypress into "waiting for page load" indefinitely (the
    // real target is a cross-origin platform endpoint). Match ONLY the step-up (login hits the same endpoint but never
    // with acr_values) and 302 it to a static same-origin page so a load event fires and we stay on the app origin,
    // while still capturing the request to assert its URL.
    const baseUrl = Cypress.config('baseUrl') as string;
    const appOrigin = Cypress.env('type') === 'localtest' ? baseUrl : `https://ttd.apps.${baseUrl.slice(8)}`;
    cy.intercept(
      {
        method: 'GET',
        pathname: '/authentication/api/v1/authentication',
        query: { acr_values: 'idporten-loa-high' },
      },
      (req) => req.reply({ statusCode: 302, headers: { location: `${appOrigin}/ttd/frontend-test/login.html` } }),
    ).as('stepUp');

    cy.startAppInstance(appFrontend.apps.frontendTest);

    cy.wait('@invalidateCookie');

    cy.wait('@stepUp').its('request.url').should('include', 'acr_values=idporten-loa-high');
  });

  it('User is redirected to unknown error page when a network call fails', () => {
    cy.allowFailureOnEnd();
    cy.intercept('GET', `**/applicationmetadata`, {
      statusCode: 401,
    }).as('getAppMetadata');
    cy.startAppInstance(appFrontend.apps.frontendTest);
    cy.get(appFrontend.instanceErrorCode).should('have.text', 'Ukjent feil');
    cy.get(appFrontend.altinnError).should('contain.text', texts.tryAgain);

    // Verify that we didn't retry
    cy.get('@getAppMetadata.all').should('have.length', 1);
  });
});
