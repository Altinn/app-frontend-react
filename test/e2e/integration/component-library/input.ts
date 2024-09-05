import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

export const fillInInputAndVerify = (text: string) => {
  cy.get('#navigation-menu').find('button').contains('1. Kort svar').click();
  cy.get('#InputPage-Input').type(text);

  // Verify Gateadresse (Street address)
  cy.get('[data-testid="summary-single-value-component"]').eq(0).find('span.fds-paragraph').should('have.text', text);
};

describe('Input component', () => {
  it('Renders the summary2 component with correct text', () => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    fillInInputAndVerify('I type some text');
  });
});
