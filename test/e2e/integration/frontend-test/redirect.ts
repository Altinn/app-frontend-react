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

    cy.intercept('PUT', '**/api/authentication/invalidatecookie', { statusCode: 200 }).as('invalidateCookie');

    // Match ONLY the step-up redirect, not the regular login flow: both hit the platform
    // /authentication/api/v1/authentication endpoint, but only the step-up carries acr_values=idporten-loa-high.
    // Reply with 204 so the browser aborts the (cross-origin) navigation and stays on the app, keeping the loader
    // mounted and letting afterEach run on the original origin.
    cy.intercept(
      {
        method: 'GET',
        pathname: '/authentication/api/v1/authentication',
        query: { acr_values: 'idporten-loa-high' },
      },
      { statusCode: 204 },
    ).as('stepUp');

    cy.startAppInstance(appFrontend.apps.frontendTest);

    // While the redirect is in flight we show a loader, never the "missing roles" error page.
    cy.get('[data-testid="loader"][data-reason="authentication-redirect"]').should('exist');
    cy.get(appFrontend.altinnError).should('not.exist');

    // The stale, too-low-level cookie is invalidated first so the platform endpoint can't short-circuit on it.
    cy.wait('@invalidateCookie');

    // Then we navigate to the Altinn 3 auth endpoint requesting a high acr_value (a real step-up via ID-porten).
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
