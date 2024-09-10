import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Subform test', () => {
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.subformTest, { authenticationLevel: '1' });
  });

  it('should test all subform functionality', () => {
    // Verify main form url
    cy.url().should('include', '/ttd/subform-test');
    cy.url().should('include', '/Task_1/utfylling');

    //Add data to main form field
    const name = 'Jonas';
    cy.get('[data-testid="Input-JQDlSQ-undefined"]').should('be.visible').type(name);

    // Test process next when required subform is missing
    cy.get('[data-testid="NavigationButtons"] button.fds-btn--primary').contains('Neste').scrollIntoView();
    cy.get('[data-testid="NavigationButtons"] button.fds-btn--primary').should('be.visible').click();
    cy.get('[data-testid="ErrorReport"]').should('be.visible');

    // Navigate to the subform page
    cy.get('#subform-subform-mopeder-add-button').should('be.visible').click();

    // Verify subform url
    cy.url().should('include', '/ttd/subform-test');
    cy.url().should('include', '/Task_1/utfylling/subform-mopeder/');
    cy.url().should('include', '/Side1');

    // Test submitting subform with missing required fields
    cy.get('#custom-button-subform-moped-exitButton').click();
    cy.get('[data-testid="ErrorReport"]').should('be.visible');
    cy.get('#custom-button-subform-moped-cancelButton').should('contain', 'Avbryt');
    cy.get('#custom-button-subform-moped-exitButton').should('contain', 'Ferdig');

    // Fill out and submit the subform
    const regno = 'FQ2345213';
    const merke = 'Toyota';
    const model = 'Yaris';
    const year = '2004';
    cy.get('#moped-regno').type(regno);
    cy.get('#moped-merke').type(merke);
    cy.get('#moped-modell').type(model);
    cy.get('#moped-produksjonsaar').type(year);
    cy.get('#custom-button-subform-moped-exitButton').click();

    // Verify subform is added to the main form table
    cy.get('#subform-subform-mopeder-table tbody tr').should('have.length', 1);
    cy.get('#subform-subform-mopeder-table tbody tr').within(() => {
      cy.get('td').eq(0).should('have.text', regno);
      cy.get('td').eq(1).should('have.text', merke);
      cy.get('td').eq(2).should('have.text', '🥺');
    });

    // Test that a new subform doesn't populate with previous data
    cy.get('#subform-subform-mopeder-add-button').click();
    cy.get('#moped-regno').should('have.value', '');
    cy.get('#moped-merke').should('have.value', '');
    cy.get('#moped-modell').should('have.value', '');
    cy.get('#moped-produksjonsaar').should('have.value', '');
    cy.get('#custom-button-subform-moped-cancelButton').click();

    // Test main form data persistence after subform submit
    cy.get('[data-testid="Input-JQDlSQ-undefined"]').should('have.value', name);
  });
});
