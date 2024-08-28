import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Group component', () => {
  it('Renders the summary2 component with correct text for Group', () => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.get('#navigation-menu').find('button').contains('7. Gruppe').click();

    // const groupTitle = 'Gruppetittel';
    // const requiredInputLabel = 'Required input field inside group';
    // const nestedGroupInputLabel = 'I am input inside nested group';
    // const nestedInput2Label = 'I am nested input 2';
    // const longTextLabel = 'Eksempel på langt svar komponent.';
    // const checkboxSectionLabel = 'Hva skal kjøretøyet brukes til?';
    // const radioSectionLabel = 'Hva slags kjøretøy har du?';
    // const checkboxValues = [
    //   'Kjøre til hytta på fjellet',
    //   'Kjøring i skogen',
    //   'Korte strekninger med bykjøring, eller annen moro',
    //   'Lange strekninger på større veier i Norge',
    // ];
    // const summarySectionHeader = 'Slik ser det ut i oppsummering';
    //
    // it('Fills in the form elements and verifies the summary', () => {
    //   // Input values to be used
    //   const groupInputValue = 'Test input for group';
    //   const nestedGroupInputValue = 'Test input inside nested group';
    //   const nestedInput2Value = 'Test input for nested input 2';
    //   const longTextValue = 'This is a long text example.';
    //
    //   // Fill in the "Required input field inside group"
    //   cy.get(`input[id="GroupPage-Input"]`).type(groupInputValue);
    //
    //   // Fill in the "I am input inside nested group"
    //   cy.get(`input[id="GroupPage-Nested-Input"]`).type(nestedGroupInputValue);
    //
    //   // Fill in the "I am nested input 2"
    //   cy.get(`input[id="GroupPage-Nested-Input2"]`).type(nestedInput2Value);
    //
    //   // Fill in the textarea for "Eksempel på langt svar komponent."
    //   cy.get(`textarea[id="GroupPage-Nested-Textarea"]`).type(longTextValue);
    //
    //   // Select checkboxes
    //   checkboxValues.forEach((value) => {
    //     const checkboxId = value.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    //     cy.get(`input[id="GroupPage-Nested-Checkboxes-${checkboxId}"]`).check();
    //   });
    //
    //   // Verify the texts and options in the summary
    //   cy.contains('h3', summarySectionHeader).should('exist');
    //
    //   cy.get('div[data-testid="summary-group-component"]').within(() => {
    //     cy.contains('span', groupTitle).should('exist');
    //     cy.contains('span', requiredInputLabel).should('exist');
    //     cy.contains('span', groupInputValue).should('exist');
    //
    //     cy.contains('span', nestedGroupInputLabel).should('exist');
    //     cy.contains('span', nestedGroupInputValue).should('exist');
    //
    //     cy.contains('span', nestedInput2Label).should('exist');
    //     cy.contains('span', nestedInput2Value).should('exist');
    //
    //     cy.contains('span', longTextLabel).should('exist');
    //     cy.contains('span', longTextValue).should('exist');
    //   });
    //
    //   // Verify checkbox selections in the summary
    //   cy.contains('h3', checkboxSectionLabel)
    //     .parent()
    //     .within(() => {
    //       checkboxValues.forEach((value) => {
    //         cy.contains('li', value).should('exist');
    //       });
    //     });
    //
    //   // Verify radio button selection
    //   cy.contains('h3', radioSectionLabel)
    //     .parent()
    //     .within(() => {
    //       // Assuming Moped was selected, adapt as needed
    //       cy.contains('span', 'Bil').should('not.exist');
    //       cy.contains('span', 'Moped').should('exist');
    //       cy.contains('span', 'Traktor').should('not.exist');
    //       cy.contains('span', 'Båt').should('not.exist');
    //     });

    const testInput1 = 'Test input for group';

    const nestedTestInput1 = 'I am input inside nested group';

    const nestedTestInput2 = 'Test input for nested input 2';

    const longText = 'This is a long text example.';

    const requiredInput = 'Required input field inside group';

    cy.get('input[id="GroupPage-Input"]').type(testInput1);

    // Fill in the "I am input inside nested group"
    cy.get('input[id="GroupPage-Nested-Input"]').type(nestedTestInput1);

    // Fill in the "I am nested input 2"
    cy.get('input[id="GroupPage-Nested-Input2"]').type(nestedTestInput2);

    // Fill in the textarea for "Eksempel på langt svar komponent."
    cy.get('textarea[id="GroupPage-Nested-Textarea"]').type(longText);

    // Select checkboxes (if necessary, depending on the form state)
    cy.get('input[id="GroupPage-Nested-Checkboxes-Kjøre-til-hytta-på-fjellet"]').check();
    cy.get('input[id="GroupPage-Nested-Checkboxes-Kjøring-i-skogen"]').check();
    cy.get('input[id="GroupPage-Nested-Checkboxes-Korte-strekninger-med-bykjøring,-eller-annen-moro"]').check();
    cy.get('input[id="GroupPage-Nested-Checkboxes-Lange-strekninger-på-større-veier-i-Norge"]').check();

    // Verify the texts and options in the summary
    cy.contains('h3', 'Slik ser det ut i oppsummering').should('exist');

    cy.get('div[data-testid="summary-group-component"]').within(() => {
      cy.contains('span', 'Gruppetittel').should('exist');
      cy.contains('span', requiredInput).should('exist');
      cy.contains('span', testInput1).should('exist');

      cy.contains('span', nestedTestInput1).should('exist');
      cy.contains('span', 'Test input inside nested group').should('exist');

      cy.contains('span', 'I am nested input 2').should('exist');
      cy.contains('span', nestedTestInput2).should('exist');

      cy.contains('span', 'Eksempel på langt svar komponent.').should('exist');
      cy.contains('span', longText).should('exist');
    });

    // Verify checkbox selections in the summary
    cy.contains('h3', 'Hva skal kjøretøyet brukes til?')
      .parent()
      .within(() => {
        cy.contains('li', 'Kjøre til hytta på fjellet').should('exist');
        cy.contains('li', 'Kjøring i skogen').should('exist');
        cy.contains('li', 'Korte strekninger med bykjøring, eller annen moro').should('exist');
        cy.contains('li', 'Lange strekninger på større veier i Norge').should('exist');
      });

    // Verify radio button selection
    cy.contains('h3', 'Hva slags kjøretøy har du?')
      .parent()
      .within(() => {
        cy.contains('span', 'Bil').should('not.exist');
        cy.contains('span', 'Moped').should('exist');
        cy.contains('span', 'Traktor').should('not.exist');
        cy.contains('span', 'Båt').should('not.exist');
      });
  });
});
