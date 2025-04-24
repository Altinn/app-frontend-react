import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Multiple select component', () => {
  it('Renders the summary2 component with correct text for MultipleSelect', () => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.gotoNavPage('Flervalg');

    // Define the text for the last three checkboxes
    const checkboxText = 'Korte strekninger med bykjøring, eller annen moro';

    cy.get('#form-content-MultipleSelectPage-Checkboxes').click();

    cy.get('u-datalist').contains('u-option', checkboxText).click();
    cy.get('div[data-componentbaseid="MultipleSelectPage-Header-Summary2-Display-String"]')
      .next()
      .find('span.ds-paragraph') // Targets the span with the summary text
      .should('have.text', checkboxText);
  });
  it('displays the values of the currently selected options', () => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.gotoNavPage('Flervalg');

    cy.get('#form-content-MultipleSelectPage-Checkboxes').click();

    cy.findByRole('option', { name: /Korte strekninger med bykjøring, eller annen moro/i }).click();
    cy.findByRole('option', { name: /Kjøring i skogen/i }).click();
    cy.findByRole('option', { name: /Kjøre til hytta på fjellet/i }).click();

    cy.findByRole('button', {
      name: /Korte strekninger med bykjøring, eller annen moro, Press to remove, 1 of 3/i,
    }).should('exist');
    cy.findByRole('button', { name: /Kjøring i skogen, Press to remove, 2 of 3/i }).should('exist');
    cy.findByRole('button', { name: /Kjøre til hytta på fjellet, Press to remove, 3 of 3/i }).should('exist');

    // the clickable element is a psuedo-element within the button
    cy.findByRole('button', { name: /Kjøring i skogen, Press to remove, 2 of 3/i }).click('right', { force: true });

    cy.findByRole('button', {
      name: /Korte strekninger med bykjøring, eller annen moro, Press to remove, 1 of 2/i,
    }).should('exist');
    cy.findByRole('button', { name: /Kjøre til hytta på fjellet, Press to remove, 2 of 2/i }).should('exist');
  });
});
