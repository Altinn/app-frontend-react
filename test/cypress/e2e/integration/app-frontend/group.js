/// <reference types='cypress' />
/// <reference types="../../support" />

import AppFrontend from '../../pageobjects/app-frontend';
import Common from '../../pageobjects/common';
import * as texts from '../../fixtures/texts.json';

const appFrontend = new AppFrontend();
const mui = new Common();

describe('Group', () => {
  const init = () => {
    cy.navigateToTask3();
    cy.get(appFrontend.group.showGroupToContinue).should('be.visible');
  };

  it('Dynamics on group', () => {
    init();
    cy.get(appFrontend.group.addNewItem).should('not.exist');
    cy.get(appFrontend.group.showGroupToContinue).find('input').check();
    cy.get(appFrontend.group.addNewItem).should('exist').and('be.visible');
  });

  [true, false].forEach((openByDefault) => {
    it(`Add and delete items on main and nested group (openByDefault = ${openByDefault ? 'true' : 'false'})`, () => {
      cy.intercept('**/api/layouts/group', (req) => {
        req.reply(res => {
          const modified = JSON.parse(res.body);
          modified.repeating.data.layout = modified.repeating.data.layout.map((component) => {
            if (component.edit && typeof component.edit.openByDefault === 'boolean') {
              component.edit.openByDefault = openByDefault;
            }
            return component;
          });

          res.send(JSON.stringify(modified));
        });
      });
      init();

      cy.get(appFrontend.group.showGroupToContinue).find('input').check();
      cy.addItemToGroup(1, 2, 'automation', openByDefault);
      cy.get(appFrontend.group.mainGroup)
        .find(mui.tableBody)
        .then((table) => {
          cy.get(table).find(mui.tableElement).first().invoke('text').should('equal', '1');
          cy.get(table).find(mui.tableElement).eq(1).invoke('text').should('equal', '2');
          cy.get(table).find(mui.tableElement).find(mui.buttonIcon).should('be.visible').click();
        });
      cy.get(appFrontend.group.mainGroup)
        .siblings(appFrontend.group.editContainer)
        .find(appFrontend.group.next)
        .should('be.visible')
        .click();
      cy.get(appFrontend.group.subGroup)
        .find(mui.tableBody)
        .then((table) => {
          cy.get(table).find(mui.tableElement).first().invoke('text').should('equal', 'automation');
          cy.get(table).find(mui.tableElement).find(mui.buttonIcon).should('be.visible').click();
        });
      cy.get(appFrontend.group.subGroup)
        .siblings(appFrontend.group.editContainer)
        .find(appFrontend.group.delete)
        .should('be.visible')
        .click();

      if (openByDefault) {
        cy.get(appFrontend.group.subGroup).find(mui.tableElement).eq(0).should('not.contain.text', 'automation');
        cy.get(appFrontend.group.comments).should('be.visible');
      } else {
        cy.get(appFrontend.group.subGroup).find(mui.tableElement).should('have.length', 0);
        cy.get(appFrontend.group.comments).should('not.exist');
      }

      cy.get(appFrontend.group.mainGroup)
        .siblings(appFrontend.group.editContainer)
        .find(appFrontend.group.back)
        .should('be.visible')
        .click();
      cy.get(appFrontend.group.mainGroup)
        .siblings(appFrontend.group.editContainer)
        .find(appFrontend.group.delete)
        .should('be.visible')
        .click();

      if (openByDefault) {
        cy.get(appFrontend.group.saveMainGroup).should('be.visible');
        cy.get(appFrontend.group.mainGroup).find(mui.tableElement).should('have.length.greaterThan', 0);
      } else {
        cy.get(appFrontend.group.saveMainGroup).should('not.exist');
        cy.get(appFrontend.group.mainGroup).find(mui.tableElement).should('have.length', 0);
      }
    });
  });

  it('Calculation on Item in Main Group should update value', () => {
    init();
    cy.get(appFrontend.group.showGroupToContinue).find('input').check();
    cy.get(appFrontend.group.addNewItem).focus().should('be.visible').click();
    cy.get(appFrontend.group.currentValue).should('be.visible').type('1337').blur().tab();
    // DataProcessingHandler.cs for frontend-test changes 1337 to 1338.
    cy.get(appFrontend.group.currentValue).should('have.value', 'NOK 1 338');
    cy.get(appFrontend.group.newValueLabel).should('contain.text', '2. Endre verdi 1338 til');
  });

  it('Validation on group', () => {
    init();
    cy.get(appFrontend.group.showGroupToContinue).find('input').check();
    cy.get(appFrontend.group.addNewItem).should('exist').and('be.visible').focus().click();
    cy.get(appFrontend.group.currentValue).should('be.visible').type('1').blur();
    cy.get(appFrontend.group.newValue).should('be.visible').type('0').blur();
    cy.get(appFrontend.fieldValidationError.replace('field', 'newValue'))
      .should('exist')
      .should('be.visible')
      .should('have.text', texts.zeroIsNotValid);
    cy.get(appFrontend.group.mainGroup).siblings(mui.gridContainer).should('contain.text', texts.errorInGroup);
    cy.get(appFrontend.group.newValue).should('be.visible').clear().type('1').blur();
    cy.get(appFrontend.fieldValidationError.replace('field', 'newValue')).should('not.exist');
    cy.get(appFrontend.group.mainGroup).siblings(mui.gridContainer).should('not.contain.text', texts.errorInGroup);
    cy.get(appFrontend.group.mainGroup)
      .siblings(appFrontend.group.editContainer)
      .find(appFrontend.group.next)
      .should('be.visible')
      .click();
    cy.get(appFrontend.group.addNewItem).should('not.exist');
    cy.get(appFrontend.group.comments).type('test').blur();
    cy.get(appFrontend.fieldValidationError.replace('field', 'comments'))
      .should('exist')
      .should('be.visible')
      .should('have.text', texts.testIsNotValidValue);
    cy.get(appFrontend.group.subGroup).siblings(mui.gridContainer).should('contain.text', texts.errorInGroup);
    cy.get(appFrontend.group.comments).clear().type('automation').blur();
    cy.get(appFrontend.fieldValidationError.replace('field', 'comments')).should('not.exist');
    cy.get(appFrontend.group.subGroup).siblings(mui.gridContainer).should('not.contain.text', texts.errorInGroup);
    cy.get(appFrontend.group.mainGroup).siblings(mui.gridContainer).should('not.contain.text', texts.errorInGroup);
    cy.get(appFrontend.group.saveSubGroup).should('be.visible').click().should('not.exist');
    cy.get(appFrontend.group.saveMainGroup).should('be.visible').click().should('not.exist');
  });

  it('should support panel group adding item to referenced group', () => {
    init();
    cy.get(appFrontend.group.showGroupToContinue).find('input').check();
    cy.get(appFrontend.group.secondGroup_add).should('exist').and('be.visible').focus().click();
    cy.get(appFrontend.group.secondGroup_add_to_reference_group).should('exist').and('be.visible').focus().click();
    cy.get(appFrontend.group.secondGroup_currentValue).should('be.visible').type('1').blur();
    cy.get(appFrontend.group.secondGroup_newValue).should('be.visible').type('2').blur();
    cy.get(appFrontend.group.secondGroup_save).focus().should('be.visible').click();
    cy.get(appFrontend.group.secondGroup_table).find('tbody').find('tr').its('length').should('eq', 1);
  });
});
