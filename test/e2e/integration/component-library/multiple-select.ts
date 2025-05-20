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
  it('Adds and removes data properly when using group and soft deletion', () => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.gotoNavPage('Flervalg');

    const multiselect = '#form-content-MultipleSelectPage-Checkboxes2';
    const multiselectList = 'u-datalist[role="listbox"]';
    const repGroup = '[data-componentid=MultipleSelectPage-RepeatingGroup]';
    //const summary1 = '[data-componentid=ListPage-Summary-Component2]';

    // Define the text for the last three checkboxes
    const checkboxText1 = 'Karoline';
    const checkboxText2 = 'Kåre';
    const checkboxText3 = 'Johanne';
    const checkboxText4 = 'Kari';
    const checkboxText5 = 'Petter';

    cy.get(multiselect).click();

    //Check options in checkboxes component
    cy.get(multiselectList).contains('span', checkboxText1).click();
    cy.get(multiselectList).contains('span', checkboxText2).click();
    cy.get(multiselectList).contains('span', checkboxText3).click();
    cy.get(multiselectList).contains('span', checkboxText4).click();
    cy.get(multiselectList).contains('span', checkboxText5).click();

    //Uncheck
    cy.get(multiselectList).contains('span', checkboxText4).click();
    cy.get(multiselectList).contains('span', checkboxText5).click();

    //Check that checkboxes is correct
    cy.findByRole('button', {
      name: `${checkboxText1}, Press to remove, 1 of 3`,
    }).should('exist');
    cy.findByRole('button', {
      name: `${checkboxText2}, Press to remove, 2 of 3`,
    }).should('exist');
    cy.findByRole('button', {
      name: `${checkboxText3}, Press to remove, 3 of 3`,
    }).should('exist');
    cy.findByRole('button', {
      name: `${checkboxText4}, Press to remove, 4 of 5`,
    }).should('not.exist');
    cy.findByRole('button', {
      name: `${checkboxText5}, Press to remove, 5 of 5`,
    }).should('not.exist');

    //Clicking on the repeating group to close the popover from the multiselect
    cy.get(repGroup).click({ force: true });

    //Validate that the corresponding options in checkboxes is avaliable in repeating group
    cy.get(repGroup).findByRole('cell', { name: checkboxText1 }).should('exist');
    cy.get(repGroup).findByRole('cell', { name: checkboxText2 }).should('exist');
    cy.get(repGroup).findByRole('cell', { name: checkboxText3 }).should('exist');
    cy.get(repGroup).findByRole('cell', { name: checkboxText4 }).should('not.exist');
    cy.get(repGroup).findByRole('cell', { name: checkboxText5 }).should('not.exist');

    // Removing from RepeatingGroup should deselect from List
    cy.get(repGroup).findAllByRole('row').should('have.length', 4); // Header + 1 row
    cy.get(repGroup)
      .findAllByRole('button', { name: /^Slett/ })
      .first()
      .click();
    cy.get(multiselect).contains('span', checkboxText1).should('not.exist');

    // Unchecking from Checkboxes should remove from RepeatingGroup (observe that data is preserved)
    cy.get(multiselect).contains('span', checkboxText2).should('exist');
    cy.get(repGroup).findAllByRole('row').should('have.length', 3); // Header + 2 row
    cy.get(repGroup)
      .findAllByRole('button', { name: /^Rediger/ })
      .first()
      .click();
    cy.findByRole('textbox', { name: /Age/ }).type('20');
    cy.findAllByRole('button', { name: /Lagre og lukk/ })
      .last()
      .click();
    cy.get(repGroup).findByRole('cell', { name: checkboxText2 }).parent().contains('td', '20');
    cy.get(multiselect).click();
    cy.get(multiselectList).contains('span', checkboxText2).click();
    cy.get(repGroup).click({ force: true }); //closing the multiselect popover
    cy.get(repGroup).findAllByRole('row').should('have.length', 2);

    // Checking 'Kåre' again should bring back the surname
    cy.get(multiselect).click();
    cy.get(multiselectList).contains('span', checkboxText2).click();
    cy.get(repGroup).click({ force: true }); //closing the multiselect popover
    cy.get(repGroup).findAllByRole('row').should('have.length', 3); // Header + 1 row
    cy.get(repGroup).findByRole('cell', { name: checkboxText2 }).should('exist');
    cy.get(repGroup).findAllByRole('cell', { name: '20' }).should('exist');
  });
  it('Renders the summary2 component with correct text for MultipleSelext with group and soft deletion', () => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.gotoNavPage('Flervalg');

    const multiselect = '#form-content-MultipleSelectPage-Checkboxes2';
    const multiselectList = 'u-datalist[role="listbox"]';
    const summary2 = '[data-componentid=MultipleSelectPage-Header-Summary2-Component2]';

    const checkboxText1 = 'Karoline';
    const checkboxText2 = 'Kåre';
    const checkboxText3 = 'Johanne';
    const checkboxText4 = 'Kari';
    const checkboxText5 = 'Petter';

    cy.get(multiselect).click();

    //Check options in checkboxes component
    cy.get(multiselectList).contains('span', checkboxText1).click();
    cy.get(multiselectList).contains('span', checkboxText2).click();
    cy.get(multiselectList).contains('span', checkboxText3).click();
    cy.get(multiselectList).contains('span', checkboxText4).click();
    cy.get(multiselectList).contains('span', checkboxText5).click();

    //Uncheck
    cy.get(multiselectList).contains('span', checkboxText4).click();
    cy.get(multiselectList).contains('span', checkboxText5).click();

    //Check that checkboxes is correct
    cy.get(multiselect).contains('span', checkboxText1).should('exist');
    cy.get(multiselect).contains('span', checkboxText2).should('exist');
    cy.get(multiselect).contains('span', checkboxText3).should('exist');
    cy.get(multiselect).contains('span', checkboxText4).should('not.exist');
    cy.get(multiselect).contains('span', checkboxText5).should('not.exist');

    const expectedText = [checkboxText1, checkboxText2, checkboxText3].join(', ');

    cy.get(`div${summary2}`)
      .next()
      .find('span.fds-paragraph') // Targets the span with the summary text
      .should('have.text', expectedText);
  });
});
