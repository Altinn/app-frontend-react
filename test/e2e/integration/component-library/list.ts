import { beforeEach } from 'mocha';

import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('List component', () => {
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.gotoNavPage('Liste (tabell)');
  });
  it('Should be possible to select multiple rows', () => {
    cy.get('input[name*="ListPage-ListWithCheckboxesComponent"]').should('have.length', 5);

    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]').contains('td', 'Johanne').parent().click();
    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]').contains('td', 'Kari').parent().click();
    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]')
      .contains('td', 'Johanne')
      .parent()
      .findByRole('checkbox')
      .should('be.checked');
    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]')
      .contains('td', 'Kari')
      .parent()
      .findByRole('checkbox')
      .should('be.checked');
  });

  it('Should be possible to deselect rows', () => {
    cy.get('input[name*="ListPage-ListWithCheckboxesComponent"]').should('have.length', 5);

    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]').contains('td', 'Johanne').parent().click();
    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]').contains('td', 'Kari').parent().click();
    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]').contains('td', 'Johanne').parent().click();
    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]')
      .contains('td', 'Johanne')
      .parent()
      .findByRole('checkbox')
      .should('not.be.checked');
    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]')
      .contains('td', 'Kari')
      .parent()
      .findByRole('checkbox')
      .should('be.checked');
  });

  it('Selections in list should apply to RepeatingGroup', () => {
    cy.get('input[name*="ListPage-ListWithCheckboxesComponent"]').should('have.length', 5);

    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]').contains('td', 'Johanne').parent().click();
    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]').contains('td', 'Kari').parent().click();
    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]').contains('td', 'Johanne').parent().click();

    cy.get('div[data-componentid*="RepeatingGroupListWithCheckboxes"]').contains('td', 'Kari');
  });

  it('Removing from RepeatingGroup should deselect from List', () => {
    cy.get('input[name*="ListPage-ListWithCheckboxesComponent"]').should('have.length', 5);

    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]').contains('td', 'Kari').parent().click();

    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]')
      .contains('td', 'Kari')
      .parent()
      .findByRole('checkbox')
      .should('be.checked');

    cy.get('div[data-componentid*="RepeatingGroupListWithCheckboxes"]')
      .contains('td', 'Kari')
      .parent()
      .contains('td', 'Slett')
      .findByRole('button')
      .click();

    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]')
      .contains('td', 'Kari')
      .parent()
      .findByRole('checkbox')
      .should('not.be.checked');
  });

  it('Deselecting in List should remove from RepeatingGroup', () => {
    cy.get('input[name*="ListPage-ListWithCheckboxesComponent"]').should('have.length', 5);

    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]').contains('td', 'Kari').parent().click();

    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]')
      .contains('td', 'Kari')
      .parent()
      .findByRole('checkbox')
      .should('be.checked');

    cy.get('div[data-componentid*="RepeatingGroupListWithCheckboxes"]')
      .contains('td', 'Kari')
      .parent()
      .contains('td', 'Rediger')
      .findByRole('button')
      .click();

    cy.findByRole('textbox', { name: /Surname/ }).type('Olsen');
    cy.findAllByRole('button', { name: /Lagre og lukk/ })
      .first()
      .click();

    cy.get('div[data-componentid*="RepeatingGroupListWithCheckboxes"]')
      .contains('td', 'Kari')
      .parent()
      .contains('td', 'Olsen');

    cy.get('div[data-componentid*="ListPage-ListWithCheckboxesComponent"]').contains('td', 'Kari').parent().click();

    cy.get('div[data-componentid*="group-RepeatingGroupListWithCheckboxes"]').should('not.exist');
  });
});
