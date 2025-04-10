import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Checkboxes component', () => {
  it('Renders the summary2 component with correct text for Checkboxes', () => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.gotoNavPage('Avkryssningsbokser');

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

    cy.get('div[data-componentbaseid="CheckboxesPage-Header-Summary2-Display-String"]')
      .next()
      .find('span.fds-paragraph') // Targets the span with the summary text
      .should('have.text', expectedText);
  });
  it('Adds and removes data properly when using group and soft deletion', () => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.gotoNavPage('Avkryssningsbokser');

    const checkboxes = '[data-componentid=CheckboxesPage-Checkboxes2]';
    const repGroup = '[data-componentid=CheckboxesPage-RepeatingGroup]';
    //const summary1 = '[data-componentid=ListPage-Summary-Component2]';

    // Define the text for the last three checkboxes
    const checkboxText1 = 'Karoline';
    const checkboxText2 = 'Kåre';
    const checkboxText3 = 'Johanne';
    const checkboxText4 = 'Kari';
    const checkboxText5 = 'Petter';

    //Check options in checkboxes component
    cy.get(checkboxes).contains('label', checkboxText1).prev('input[type="checkbox"]').click();
    cy.get(checkboxes).contains('label', checkboxText2).prev('input[type="checkbox"]').click();
    cy.get(checkboxes).contains('label', checkboxText3).prev('input[type="checkbox"]').click();
    cy.get(checkboxes).contains('label', checkboxText4).prev('input[type="checkbox"]').click();
    cy.get(checkboxes).contains('label', checkboxText5).prev('input[type="checkbox"]').click();

    //Uncheck
    cy.get(checkboxes).contains('label', checkboxText4).prev('input[type="checkbox"]').click();
    cy.get(checkboxes).contains('label', checkboxText5).prev('input[type="checkbox"]').click();

    cy.get(checkboxes).contains('label', checkboxText5).prev('input[type="checkbox"]').click();
    cy.get(checkboxes).findByRole('cell', { name: 'Johanne' }).parent().findByRole('checkbox').should('be.checked');
    cy.get(checkboxes).findByRole('cell', { name: 'Kari' }).parent().findByRole('checkbox').should('be.checked');

    //Validate that the corresponding options in checkboxes is avaliable in repeating group<
    cy.get(repGroup).findByRole('cell', { name: checkboxText1 }).should('exist');
    cy.get(repGroup).findByRole('cell', { name: checkboxText2 }).should('exist');
    cy.get(repGroup).findByRole('cell', { name: checkboxText3 }).should('exist');
  });
});
