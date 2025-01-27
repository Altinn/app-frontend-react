import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

const prefilledValue = 'designer';

describe('Start stateless with query params', () => {
  beforeEach(() => {
    //http://local.altinn.cloud/ttd/stateless-app/set-query-params?geir=svein

    cy.visit(`${Cypress.config('baseUrl')}/ttd/stateless-app/set-query-params?jobTitle=${prefilledValue}`, {
      failOnStatusCode: true, // if necessary, in case the server sends non-2xx status codes during redirects
    });

    cy.intercept('**/api/layoutsettings/stateless').as('getLayoutStateless');
    cy.startAppInstance(appFrontend.apps.stateless);
    cy.wait('@getLayoutStateless');
    cy.get(appFrontend.stateless.name).should('exist').and('be.visible');
  });

  it('Prefill from query params', () => {
    // cy.get('body').should('have.css', 'background-color', 'rgb(239, 239, 239)');
    // cy.findByRole('button', { name: /lukk skjema/i }).should('not.exist');
    // cy.get(appFrontend.stateless.name).invoke('val').should('not.be.empty');
    // cy.get(appFrontend.stateless.number).should('have.value', '1364');
    // cy.get(appFrontend.stateless.name).clear();
    // cy.get(appFrontend.stateless.name).type('test');
    // cy.get(appFrontend.stateless.name).blur();
    cy.get(appFrontend.stateless.jobTitle).should('have.value', prefilledValue);
    //cy.startStatefulFromStateless();

    cy.get(appFrontend.instantiationButton).click();

    //
    cy.get(appFrontend.stateless.prefilledJobTitle).should('have.value', 'productowner');

    //jobTitle

    // cy.get(appFrontend.header).should('contain.text', appFrontend.apps.stateless).and('contain.text', texts.ttd);
    // cy.snapshot('stateless');
  });
  //
  // it('Dynamics in stateless app', () => {
  //   cy.get(appFrontend.stateless.name).clear();
  //   cy.get(appFrontend.stateless.name).type('automation');
  //   cy.get(appFrontend.stateless.name).blur();
  //   cy.get(appFrontend.stateless.idnummer2).should('exist').and('be.visible');
  //   cy.get(appFrontend.stateless.name).clear();
  //   cy.get(appFrontend.stateless.name).type('abc');
  //   cy.get(appFrontend.stateless.name).blur();
  //   cy.get(appFrontend.stateless.idnummer2).should('not.exist');
  // });
  //
  // it('Logout from appfrontend', () => {
  //   cy.findByRole('button', { name: 'Profil ikon knapp' }).click();
  //   cy.findByRole('dialog', { name: 'Profil ikon knapp' }).should('exist');
  //   cy.findByRole('link', { name: 'Logg ut' }).should('be.visible');
  // });
  //
  // it('is possible to start app instance from stateless app', () => {
  //   const userFirstName = Cypress.env('defaultFirstName');
  //   cy.startStatefulFromStateless();
  //   cy.findByRole('textbox', { name: /navn/i }).should('have.value', userFirstName);
  //   cy.findByRole('textbox', { name: /id/i }).should('have.value', '1364');
  //   cy.findByRole('button', { name: /send inn/i }).should('be.visible');
  // });
  //
  // it('back button should work after starting an instance', () => {
  //   cy.get(appFrontend.stateless.name).clear();
  //   cy.get(appFrontend.stateless.name).type('hello world');
  //   cy.get(appFrontend.stateless.number).clear();
  //   cy.get(appFrontend.stateless.number).type('6789');
  //   cy.get(appFrontend.instantiationButton).click();
  //   cy.get('#sendInButton').should('exist');
  //   cy.window().then((win) => win.history.back());
  //   cy.get(appFrontend.instantiationButton).should('exist');
  // });
});
