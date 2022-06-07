/// <reference types='cypress' />
/// <reference types="../../support" />

import AppFrontend from '../../pageobjects/app-frontend';
import Common from '../../pageobjects/common';
import * as texts from '../../fixtures/texts.json';

const appFrontend = new AppFrontend();
const mui = new Common();

describe('Validation', () => {
  it('Required field validation on blur', () => {
    cy.navigateToChangeName();
    cy.get(appFrontend.changeOfName.newFirstName).should('be.visible').focus().blur();
    cy.get(appFrontend.fieldValidationError.replace('field', appFrontend.changeOfName.newFirstName.substring(1)))
      .should('exist')
      .should('be.visible')
      .should('have.text', texts.requiredField)
      .find(appFrontend.errorExclamation)
      .should('be.visible');
  });

  it('Custom field validation - error', () => {
    cy.navigateToChangeName();
    cy.intercept('GET', '**/validate').as('validateData');
    cy.get(appFrontend.changeOfName.newFirstName).should('be.visible').type('test').blur();
    cy.wait('@validateData');
    cy.get(appFrontend.fieldValidationError.replace('field', appFrontend.changeOfName.newFirstName.substring(1)))
      .should('exist')
      .should('be.visible')
      .should('have.text', texts.testIsNotValidValue)
      .then((error) => {
        cy.get(error).find(appFrontend.errorExclamation).should('be.visible');
        cy.get(error).find('a[href="https://www.altinn.no/"]').should('exist');
      });
  });

  it('Soft validation - warning', () => {
    cy.navigateToChangeName();
    cy.intercept('GET', '**/validate').as('validateData');
    cy.get(appFrontend.changeOfName.newMiddleName).should('be.visible').type('success').blur();
    cy.wait('@validateData');
    cy.get(appFrontend.fieldValidationWarning.replace('field', appFrontend.changeOfName.newMiddleName.substring(1)))
      .should('exist')
      .should('be.visible')
      .should('have.text', texts.testIsNotValidValue);
  });

  it('Soft validation - info', () => {
    cy.navigateToChangeName();
    cy.intercept('GET', '**/validate').as('validateData');
    cy.get(appFrontend.changeOfName.newMiddleName).should('be.visible').type('info').blur();
    cy.wait('@validateData');
    cy.get(appFrontend.fieldValidationInfo.replace('field', appFrontend.changeOfName.newMiddleName.substring(1)))
      .should('exist')
      .should('be.visible')
      .should('have.text', texts.infoMessage);
  });

  it('Soft validation - success', () => {
    cy.navigateToChangeName();
    cy.intercept('GET', '**/validate').as('validateData');
    cy.get(appFrontend.changeOfName.newMiddleName).should('be.visible').type('test').blur();
    cy.wait('@validateData');
    cy.get(appFrontend.fieldValidationSuccess.replace('field', appFrontend.changeOfName.newMiddleName.substring(1)))
      .should('exist')
      .should('be.visible')
      .should('have.text', texts.successMessage);
  });

  it('Page validation on clicking next', () => {
    cy.navigateToChangeName();
    cy.get(appFrontend.changeOfName.newFirstName).should('be.visible').clear().type('test').blur();
    cy.get(appFrontend.changeOfName.confirmChangeName).should('be.visible').find('input').check();
    cy.intercept('GET', '**/validate').as('validateData');
    cy.get(mui.button).should('be.visible').click();
    cy.wait('@validateData');
    cy.get(appFrontend.errorReport)
      .should('exist')
      .should('be.visible')
      .should('be.focused')
      .should('contain.text', texts.errorReport);
  });

  it('Validation on uploaded attachment type', () => {
    cy.navigateToChangeName();
    cy.get(appFrontend.changeOfName.upload).selectFile('e2e/fixtures/test.png', { force: true });
    cy.get(appFrontend.fieldValidationError.replace('field', appFrontend.changeOfName.upload.substring(1)))
      .should('exist')
      .should('be.visible')
      .should('contain.text', texts.attachmentError);
  });

  it('Client side validation from json schema', () => {
    cy.navigateToChangeName();
    cy.get(appFrontend.changeOfName.newLastName).should('be.visible').type('client').blur();
    cy.get(appFrontend.fieldValidationError.replace('field', appFrontend.changeOfName.newLastName.substring(1)))
      .should('exist')
      .should('be.visible')
      .should('have.text', texts.clientSide);
  });

  it('Task validation', () => {
    cy.intercept('**/active', []).as('noActiveInstances');
    cy.startAppInstance(Cypress.env('multiData2Stage'));
    cy.get(appFrontend.closeButton).should('be.visible');
    cy.intercept('GET', '**/validate', [
      {
        severity: 1,
        code: 'error',
        description: 'task validation',
      },
    ]);
    cy.get(appFrontend.sendinButton).should('be.visible').click();
    cy.get(appFrontend.errorReport)
      .should('exist')
      .should('be.visible')
      .should('be.focused')
      .should('contain.text', 'task validation');
  });
});
