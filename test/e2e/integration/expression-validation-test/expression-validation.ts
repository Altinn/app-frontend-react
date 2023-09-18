import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Expression validation', () => {
  beforeEach(() => {
    cy.intercept('**/active', []).as('noActiveInstances');
    cy.intercept('POST', `**/instances?instanceOwnerPartyId*`).as('createInstance');
    cy.startAppInstance(appFrontend.apps.expressionValidationTest);
  });

  it('should show validation messages', () => {
    cy.findByRole('textbox', { name: /fornavn/i }).type('Per');
    cy.findByRole('textbox', { name: /etternavn/i }).type('Hansen');

    cy.findByRole('textbox', { name: /alder/i }).type('17');
    cy.findByRole('alert', { name: /skriftlige samtykke/i }).should('be.visible');
    cy.get(appFrontend.errorReport).should('not.exist');
    cy.findByRole('textbox', { name: /alder/i }).clear();
    cy.findByRole('textbox', { name: /alder/i }).type('14');
    cy.findByRole('alert', { name: /skriftlige samtykke/i }).should('not.exist');
    cy.get(appFrontend.errorReport).should('contain.text', 'Minste gyldig tall er 15');
    cy.findByRole('textbox', { name: /alder/i }).clear();
    cy.findByRole('textbox', { name: /alder/i }).type('15');
    cy.findByRole('alert', { name: /skriftlige samtykke/i }).should('be.visible');
    cy.get(appFrontend.errorReport).should('not.exist');
    cy.findByRole('textbox', { name: /alder/i }).clear();
    cy.findByRole('textbox', { name: /alder/i }).type('18');
    cy.findByRole('alert', { name: /skriftlige samtykke/i }).should('not.exist');
    cy.get(appFrontend.errorReport).should('not.exist');

    cy.get(appFrontend.expressionValidationTest.kjønn).dsSelect('Mann');

    cy.findByRole('textbox', { name: /e-post/i }).type('asdf');
    cy.get(appFrontend.errorReport).should('contain.text', 'Feil format');
    cy.findByRole('textbox', { name: /e-post/i }).clear();
    cy.findByRole('textbox', { name: /e-post/i }).type('test@test.test');
    cy.get(appFrontend.errorReport).should('not.contain.text', 'Feil format eller verdi');
    cy.get(appFrontend.errorReport).should('contain.text', "E-post må slutte med '@altinn.no'");
    cy.findByRole('textbox', { name: /e-post/i }).clear();
    cy.findByRole('textbox', { name: /e-post/i }).type('test@altinn.no');
    cy.get(appFrontend.errorReport).should('not.exist');

    cy.findByRole('textbox', { name: /telefonnummer/i }).type('45612378');
    cy.get(appFrontend.errorReport).should('contain.text', "Telefonnummer må starte med '9'");
    cy.findByRole('textbox', { name: /telefonnummer/i }).clear();
    cy.findByRole('textbox', { name: /telefonnummer/i }).type('98765432');
    cy.get(appFrontend.errorReport).should('not.exist');

    cy.get(appFrontend.expressionValidationTest.bosted).dsSelect('Oslo');

    cy.findByRole('button', { name: /neste/i }).click();
    cy.navPage('Skjul felter').should('have.attr', 'aria-current', 'page');
    cy.get(appFrontend.errorReport).should('not.exist');

    cy.findByRole('button', { name: /send inn/i }).click();
    cy.get(appFrontend.receipt.container).should('be.visible');
  });

  it.only('should ignore hidden fields', () => {
    cy.findByRole('textbox', { name: /alder/i }).type('16');
    cy.findByRole('textbox', { name: /e-post/i }).type('test@test.test');
    cy.findByRole('textbox', { name: /telefonnummer/i }).type('45612378');

    cy.findByRole('button', { name: /send inn/i }).click();
    cy.get(appFrontend.errorReport).should('be.visible');
    cy.findByRole('alert', { name: /skriftlige samtykke/i }).should('be.visible');
    cy.gotoNavPage('Skjul felter');

    cy.get(appFrontend.errorReport).should('contain.text', 'Du må fylle ut fornavn');
    cy.findByRole('checkbox', { name: /fornavn/i }).dsCheck();
    cy.get(appFrontend.errorReport).should('not.contain.text', 'Du må fylle ut fornavn');

    cy.get(appFrontend.errorReport).should('contain.text', 'Du må fylle ut etternavn');
    cy.findByRole('checkbox', { name: /etternavn/i }).dsCheck();
    cy.get(appFrontend.errorReport).should('not.contain.text', 'Du må fylle ut etternavn');

    cy.get(appFrontend.errorReport).should('contain.text', 'Du må fylle ut kjønn');
    cy.findByRole('checkbox', { name: /kjønn/i }).dsCheck();
    cy.get(appFrontend.errorReport).should('not.contain.text', 'Du må fylle ut kjønn');

    cy.get(appFrontend.errorReport).should('contain.text', "E-post må slutte med '@altinn.no'");
    cy.findByRole('checkbox', { name: /e-post/i }).dsCheck();
    cy.get(appFrontend.errorReport).should('not.contain.text', "E-post må slutte med '@altinn.no'");

    cy.get(appFrontend.errorReport).should('contain.text', "Telefonnummer må starte med '9'");
    cy.findByRole('checkbox', { name: /telefon/i }).dsCheck();
    cy.get(appFrontend.errorReport).should('not.contain.text', "Telefonnummer må starte med '9'");

    cy.get(appFrontend.errorReport).should('contain.text', 'Du må fylle ut bosted');
    cy.findByRole('checkbox', { name: /bosted/i }).dsCheck();
    cy.get(appFrontend.errorReport).should('not.exist');

    cy.findByRole('button', { name: /send inn/i }).click();
    cy.get(appFrontend.receipt.container).should('be.visible');
  });
});
