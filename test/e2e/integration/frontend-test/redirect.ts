import texts from 'test/e2e/fixtures/texts.json';
import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

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

    // A 403 carrying a RequiredAuthenticationLevel means the user is authenticated, but at a too low security level.
    cy.intercept('POST', `**/instances?instanceOwnerPartyId*`, {
      statusCode: 403,
      body: { RequiredAuthenticationLevel: 3 },
    }).as('instantiate');

    cy.intercept('PUT', '**/api/authentication/invalidatecookie', { statusCode: 200, delay: 1000 }).as(
      'invalidateCookie',
    );

    cy.intercept('GET', '**/authentication/api/v1/authentication*', { statusCode: 200, body: 'redirected' }).as(
      'stepUp',
    );

    cy.startAppInstance(appFrontend.apps.frontendTest);

    cy.get('[data-testid="loader"][data-reason="authentication-redirect"]').should('exist');
    cy.get(appFrontend.altinnError).should('not.exist');

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
