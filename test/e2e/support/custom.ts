import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import JQueryWithSelector = Cypress.JQueryWithSelector;

const appFrontend = new AppFrontend();

Cypress.Commands.add('assertTextWithoutWhiteSpaces', { prevSubject: true }, (subject, expectedText) => {
  const normalWhiteSpace = (subject[0].value || ' ').replace(/\u00a0/g, ' ');
  expect(normalWhiteSpace).to.equal(expectedText || ' ');
});

Cypress.Commands.add('isVisible', { prevSubject: true }, (subject) => {
  const isVisible = (elem) => !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
  expect(isVisible(subject[0])).to.be.true;
});

Cypress.Commands.add('dsCheck', { prevSubject: true }, (subject: JQueryWithSelector | undefined) => {
  if (subject && !subject.is(':checked')) {
    cy.wrap(subject).parent().click();
  }
});

Cypress.Commands.add('dsUncheck', { prevSubject: true }, (subject: JQueryWithSelector | undefined) => {
  if (subject && subject.is(':checked')) {
    cy.wrap(subject).parent().click();
  }
});

Cypress.Commands.add('dsSelect', { prevSubject: true }, (subject: JQueryWithSelector | undefined, name) => {
  cy.wrap(subject).click();
  cy.wrap(subject).parents('[data-testid="select-root"]').findByRole('option', { name }).click();
  cy.get('body').click();
  cy.wrap(subject);
});

Cypress.Commands.add('clickAndGone', { prevSubject: true }, (subject: JQueryWithSelector | undefined) => {
  // eslint-disable-next-line cypress/unsafe-to-chain-command
  cy.wrap(subject).click().should('not.exist');
});

Cypress.Commands.add('navPage', (page: string) => {
  cy.window().then((win) => {
    const regex = new RegExp(`^[0-9]+. ${page}$`);

    if (win.innerWidth > 768) {
      cy.get(appFrontend.navMenu).findByText(regex);
    } else {
      cy.get('nav[data-testid=NavigationBar] button').should('have.attr', 'aria-expanded', 'false').click();
      cy.get(appFrontend.navMenu).findByText(regex);
    }
  });
});
