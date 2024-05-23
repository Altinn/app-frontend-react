import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('validating multiple data models', () => {
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.multipleDatamodelsTest);
  });

  it('shows validations for multiple data models', () => {
    cy.waitForLoad();

    cy.get(appFrontend.errorReport).should('not.exist');
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField1)).should('not.exist');
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField2)).should('not.exist');

    cy.findByRole('textbox', { name: /tekstfelt 1/i }).type('Dette er en litt for lang tekst');
    cy.findByRole('textbox', { name: /tekstfelt 2/i }).type('Dette er en annen veldig lang tekst');
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField1)).should(
      'contain.text',
      'Bruk 10 eller færre tegn',
    );
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField2)).should(
      'contain.text',
      'Bruk 10 eller færre tegn',
    );
    cy.get(appFrontend.errorReport).findAllByRole('listitem').should('have.length', 2);

    cy.findByRole('textbox', { name: /tekstfelt 1/i }).clear();
    cy.findByRole('textbox', { name: /tekstfelt 2/i }).clear();

    cy.get(appFrontend.errorReport).should('not.exist');

    cy.findByRole('textbox', { name: /postnr/i }).type('0000');
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.addressField)).should(
      'contain.text',
      'Postnummer er ugyldig',
    );
    cy.get(appFrontend.errorReport).findAllByRole('listitem').should('have.length', 1);
    cy.findByRole('textbox', { name: /postnr/i }).clear();
    cy.get(appFrontend.errorReport).should('not.exist');
  });
});
