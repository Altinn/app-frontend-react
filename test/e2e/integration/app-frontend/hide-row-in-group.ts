import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

it('should be possible to hide rows when "Endre fra" is greater or equals to', () => {
  cy.goto('group');
  cy.get(appFrontend.group.prefill.liten).click().blur();
  cy.get(appFrontend.nextButton).click();
  cy.get(appFrontend.group.hideRepeatingGroupRow).should('be.visible');
  cy.get(appFrontend.group.hideRepeatingGroupRow).clear().type('400');
  cy.get(appFrontend.group.showGroupToContinue).find('input').check();
  cy.get(appFrontend.group.edit).should('be.visible');
  cy.get(appFrontend.group.hideRepeatingGroupRow).clear().type('1');
  cy.get(appFrontend.group.edit).should('not.exist');
});
