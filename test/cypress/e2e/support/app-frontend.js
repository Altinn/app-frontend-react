/// <reference types='cypress' />
import AppFrontend from '../pageobjects/app-frontend';

const appFrontend = new AppFrontend();

Cypress.Commands.add('reloadAndWait', () => {
  cy.reload();
  cy.get('#readyForPrint').should('exist');
});

Cypress.Commands.add('addItemToGroup', (oldValue, newValue, comment, openByDefault) => {
  if (!openByDefault) {
    cy.get(appFrontend.group.addNewItem).should('be.visible').focus().click();
  }

  cy.get(appFrontend.group.currentValue).should('be.visible').type(oldValue).blur();
  cy.get(appFrontend.group.newValue).should('be.visible').type(newValue).blur();
  cy.get(appFrontend.group.mainGroup)
    .find(appFrontend.group.editContainer)
    .find(appFrontend.group.next)
    .should('be.visible')
    .click();

  if (openByDefault || typeof openByDefault === 'undefined') {
    cy.get(appFrontend.group.addNewItemSubGroup).should('not.exist');
  } else {
    cy.get(appFrontend.group.addNewItemSubGroup).click();
  }

  cy.get(appFrontend.group.comments).should('be.visible').type(comment).blur();
  cy.get(appFrontend.group.saveSubGroup).should('be.visible').click().should('not.exist');
  cy.get(appFrontend.group.saveMainGroup).should('be.visible').click().should('not.exist');
});

Cypress.Commands.add('startStateFullFromStateless', () => {
  cy.intercept('POST', '**/instances/create').as('createInstance');
  cy.intercept('**/api/layoutsettings/statefull').as('getLayoutSettings');
  cy.get(appFrontend.instantiationButton).should('be.visible').click();
  cy.wait('@createInstance').its('response.statusCode').should('eq', 201);
  cy.wait('@getLayoutSettings');
});

Cypress.Commands.add('getReduxState', (selector) => {
  return cy
    .window()
    .its('reduxStore')
    .invoke('getState')
    .then((state) => {
      if (selector) {
        return selector(state);
      }

      return state;
    });
});

Cypress.Commands.add('interceptLayout', (layoutName, mutator) => {
  cy.intercept(`**/api/layouts/${layoutName}`, (req) => {
    req.reply((res) => {
      const set = JSON.parse(res.body);
      for (const layout of Object.values(set)) {
        layout.data.layout = layout.data.layout.map(mutator);
      }
      res.send(JSON.stringify(set));
    });
  });
});
