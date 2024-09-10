import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Subform test', () => {
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.subformTest, { authenticationLevel: '2' });
  });
  it('should navigate to the subform page when clicking the add button', () => {
    // Verify main form url
    cy.url().should('include', '/ttd/subform-test');
    cy.url().should('include', '/Task_1/utfylling');

    cy.get('#subform-subform-mopeder-add-button').should('be.visible').click();

    // Verify subform url
    cy.url().should('include', '/ttd/subform-test');
    cy.url().should('include', '/Task_1/utfylling/subform-mopeder/');
    cy.url().should('include', '/Side1');

    cy.get('#moped-regno').should('exist');
  });
  it('should not allow submitting subform with missing required', () => {
    cy.get('#subform-subform-mopeder-add-button').should('be.visible').click();
    // Attempt to submit the form without filling any fields
    cy.get('#custom-button-subform-moped-exitButton').click();

    // Check if the error box appears
    cy.get('[data-testid="ErrorReport"]').should('be.visible');

    // Verify that the "Avbryt" and "Ferdig" buttons are still present
    cy.get('#custom-button-subform-moped-cancelButton').should('contain', 'Avbryt');
    cy.get('#custom-button-subform-moped-exitButton').should('contain', 'Ferdig');
  });
  it('should add subform to main form table when subform is submitted', () => {
    const regno = 'FQ2345213';
    const merke = 'Toyota';
    const model = 'Yaris';
    const year = '2004';
    cy.get('#subform-subform-mopeder-add-button').should('be.visible').click();
    cy.get('#moped-regno').type(regno);
    cy.get('#moped-merke').type(merke);
    cy.get('#moped-modell').type(model);
    cy.get('#moped-produksjonsaar').type(year);

    cy.get('#custom-button-subform-moped-exitButton').should('be.visible').click();

    // Verify subform is added to tha main form table and values are as expected
    cy.get('#subform-subform-mopeder-table tbody tr').should('have.length', 1);
    cy.get('#subform-subform-mopeder-table tbody tr').within(() => {
      cy.get('td').eq(0).should('have.text', regno);
      cy.get('td').eq(1).should('have.text', merke);
      cy.get('td').eq(2).should('have.text', '🥺');
    });
  });
  it('should not populate a subform with data from previous subform', () => {
    // We had a bug where opening a new subform would show you data from a previous one
    // This test will prevent this happening again
    cy.get('#subform-subform-mopeder-add-button').should('be.visible').click();
    cy.get('#moped-regno').type('FQ2345213');
    cy.get('#moped-merke').type('Toyota');
    cy.get('#moped-modell').type('Yaris');
    cy.get('#moped-produksjonsaar').type('2004');
    cy.get('#custom-button-subform-moped-exitButton').should('be.visible').click();
    cy.waitForLoad();
    cy.get('#subform-subform-mopeder-add-button').should('be.visible').click();
    cy.get('#moped-regno').should('have.value', '');
    cy.get('#moped-merke').should('have.value', '');
    cy.get('#moped-modell').should('have.value', '');
    cy.get('#moped-produksjonsaar').should('have.value', '');
  });
  it('should show data from main form when submitting subform', () => {
    const name = 'Jonas';
    cy.get('[data-testid="Input-JQDlSQ-undefined"]').should('be.visible');
    cy.get('[data-testid="Input-JQDlSQ-undefined"]').type(name);

    cy.get('#subform-subform-mopeder-add-button').should('be.visible').click();
    cy.get('#moped-regno').type('FQ2345213');
    cy.get('#moped-merke').type('Toyota');
    cy.get('#moped-modell').type('Yaris');
    cy.get('#moped-produksjonsaar').type('2004');
    cy.get('#custom-button-subform-moped-exitButton').should('be.visible').click();
    cy.waitForLoad();
    cy.get('[data-testid="Input-JQDlSQ-undefined"]').should('have.value', name);
  });
  it('should show data from main form when exiting subform', () => {
    const name = 'Jonas';
    cy.get('[data-testid="Input-JQDlSQ-undefined"]').should('be.visible');
    cy.get('[data-testid="Input-JQDlSQ-undefined"]').type(name);

    cy.get('#subform-subform-mopeder-add-button').should('be.visible').click();
    cy.get('#custom-button-subform-moped-cancelButton').should('be.visible').click();
    cy.waitForLoad();
    cy.get('[data-testid="Input-JQDlSQ-undefined"]').should('have.value', name);
  });
  it('should not allow process next in main form when required subform is missing', () => {
    cy.get('[data-testid="NavigationButtons"] button.fds-btn--primary').contains('Neste').scrollIntoView();
    cy.get('[data-testid="NavigationButtons"] button.fds-btn--primary').should('be.visible').click();
    // Check if the error box appears
    cy.get('[data-testid="ErrorReport"]').should('be.visible');
  });
});
