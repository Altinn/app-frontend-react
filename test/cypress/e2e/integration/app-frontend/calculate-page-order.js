/// <reference types='cypress' />
/// <reference types="../../support" />

import AppFrontend from '../../pageobjects/app-frontend';
import Common from '../../pageobjects/common';
import * as texts from '../../fixtures/texts.json';

const appFrontend = new AppFrontend();
const mui = new Common();

describe('Calculate Page Order', () => {
  it('Testing combinations of old and new hidden pages functionalities', () => {
    cy.interceptLayout('group', () => {}, (layoutSet) => {
      layoutSet.prefill.data.hidden = ['equals', ['component', 'sendersName'], 'hidePrefill'];
      layoutSet.repeating.data.hidden = ['equals', ['component', 'sendersName'], 'hideRepeating'];
    });
    cy.intercept('POST', '**/pages/order*').as('getPageOrder');

    cy.goto('group');
    cy.contains(mui.button, texts.next).click();
    cy.get(appFrontend.group.showGroupToContinue).then((checkbox) => {
      cy.get(checkbox).should('be.visible').find('input').check();
    });

    cy.get(appFrontend.navMenuButtons).should('have.length', 4);

    cy.addItemToGroup(1, 11, 'automation');
    cy.contains(mui.button, texts.next).click();
    cy.wait('@getPageOrder');

    cy.get(appFrontend.navMenuButtons).should('have.length', 3);
    cy.get(appFrontend.group.sendersName).should('not.exist');
    cy.get(appFrontend.group.summaryText).should('be.visible');

    cy.get(appFrontend.navMenu).find('li > button').eq(1).click();
    cy.get(appFrontend.group.rows[0].editBtn).click();
    cy.get(appFrontend.group.newValue).clear().type('2');

    cy.get(appFrontend.navButtons).contains(mui.button, texts.next).click();
    cy.wait('@getPageOrder');
    cy.get(appFrontend.navMenuButtons).should('have.length', 4);
    cy.get(appFrontend.group.sendersName).should('exist');

    cy.get(appFrontend.navMenuButtons).should('contain.text', '1. prefill');
    cy.get(appFrontend.group.sendersName).type('hidePrefill');
    cy.get(appFrontend.navMenuButtons).should('have.length', 3);
    cy.get(appFrontend.navMenuButtons).should('contain.text', '1. repeating');
    cy.get(appFrontend.group.sendersName).clear().type('hideRepeating');
    cy.get(appFrontend.navMenuButtons).should('have.length', 3);
    cy.get(appFrontend.navMenuButtons).should('contain.text', '1. prefill');
    cy.get(appFrontend.navMenuButtons).should('contain.text', '2. hide');
  });
});
