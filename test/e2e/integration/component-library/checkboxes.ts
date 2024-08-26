import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Checkboxes component', () => {
  it('Renders the summary2 component with correct text for Checkboxes', () => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.get('#navigation-menu').find('button').contains('4. Avkryssningsbokser').click();

    // Define the text for the last three checkboxes
    const checkboxText1 = 'Korte strekninger med bykjøring, eller annen moro';
    const checkboxText2 = 'Lange strekninger på større veier i Norge';
    const checkboxText3 = 'Kjøring i skogen';

    const expectedText = [checkboxText1, checkboxText2, checkboxText3].join(', ');

    // Click the checkbox for "Korte strekninger med bykjøring, eller annen moro"
    cy.contains('label', checkboxText1).prev('input[type="checkbox"]').check();

    // Click the checkbox for "Lange strekninger på større veier i Norge"
    cy.contains('label', checkboxText2).prev('input[type="checkbox"]').check();

    // Click the checkbox for "Kjøring i skogen"
    cy.contains('label', checkboxText3).prev('input[type="checkbox"]').check();

    //cy.contains('CheckboxesPage-Header-Summary2-Display-String', 'Hva skal kjøretøyet brukes til?')
    // cy.get('h4#CheckboxesPage-Header-Summary2-Display-String')
    //   .parent() // Moves up to the parent div that contains the h4
    //   .parent() // Moves up to the grandparent div
    //   .siblings() // Moves up to the parent div that contains both the label and the span
    cy.get('div[data-componentbaseid="CheckboxesPage-Header-Summary2-Display-String"]')
      .next() // Navigate to the sibling element containing the summary
      .find('span.fds-paragraph') // Targets the span with the summary text
      .should('have.text', expectedText);
  });
});
