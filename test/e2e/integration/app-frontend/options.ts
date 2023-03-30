import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Options', () => {
  it('is possible to retrieve options dynamically', () => {
    cy.goto('changename');
    // Case: options are dynamically refetched based on what the user selects as source
    cy.get(appFrontend.changeOfName.sources).should('be.visible');

    // Make sure we wait until the option is visible, as it's not instant
    cy.get('[role=option][value="nordmann"]').should('exist');

    cy.get(appFrontend.changeOfName.reference).dsSelect('Ola Nordmann').should('have.value', 'Ola Nordmann');

    //Secure options
    cy.get(appFrontend.changeOfName.reference2).get('[role=option][value=1]').should('exist');
    cy.get(appFrontend.changeOfName.reference2).dsSelect('Ole').and('have.value', 'Ole');

    // Select a different source, expect previous selection to be cleared and
    // new value to be selectable in the reference option
    cy.get(appFrontend.changeOfName.sources).dsSelect('Digitaliseringsdirektoratet');
    cy.get(appFrontend.changeOfName.reference).and('have.value', '');
    cy.get(appFrontend.changeOfName.reference).dsSelect('Sophie Salt').should('have.value', 'Sophie Salt');
    cy.get(appFrontend.changeOfName.reference2).dsSelect('Dole').and('have.value', 'Dole');
  });

  it('is possible to build options from repeating groups', () => {
    cy.goto('group');
    cy.get(appFrontend.navMenu).should('be.visible');
    cy.get(appFrontend.nextButton).click();
    cy.get(appFrontend.group.showGroupToContinue).find('input').dsCheck();
    cy.addItemToGroup(1, 2, 'automation');
    cy.addItemToGroup(3, 4, 'altinn');
    cy.get(appFrontend.group.options).then((options) => {
      cy.wrap(options).should('be.visible');
      cy.wrap(options)
        .parents('[data-testid="select-root"]')
        .find('[role=option]')
        .eq(0)
        .should('have.text', 'Endre fra: 1, Endre til: 2');
      cy.wrap(options)
        .parents('[data-testid="select-root"]')
        .find('[role=option]')
        .eq(1)
        .should('have.text', 'Endre fra: 3, Endre til: 4');
      cy.wrap(options).dsSelect('Endre fra: 1, Endre til: 2').should('have.value', 'Endre fra: 1, Endre til: 2');
    });
  });
});
