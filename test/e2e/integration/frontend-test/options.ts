import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

import type { IOption } from 'src/layout/common.generated';

const appFrontend = new AppFrontend();

describe('Options', () => {
  it('is possible to retrieve options dynamically', () => {
    cy.goto('changename');
    // Case: options are dynamically refetched based on what the user selects as source
    cy.get(appFrontend.changeOfName.sources).should('be.visible');

    // Make sure we wait until the option is visible, as it's not instant
    cy.get('[role=option][value="nordmann"]').should('exist');

    cy.get(appFrontend.changeOfName.reference).dsSelect('Ola Nordmann');
    cy.get(appFrontend.changeOfName.reference).should('have.value', 'Ola Nordmann');

    //Secure options
    cy.get(appFrontend.changeOfName.reference2).get('[role=option][value=1]').should('exist');
    cy.get(appFrontend.changeOfName.reference2).dsSelect('Ole');
    cy.get(appFrontend.changeOfName.reference2).should('have.value', 'Ole');

    // Select a different source, expect previous selection to be cleared and
    // new value to be selectable in the reference option
    cy.get(appFrontend.changeOfName.sources).dsSelect('Digitaliseringsdirektoratet');
    cy.get(appFrontend.changeOfName.reference).and('have.value', '');
    cy.get(appFrontend.changeOfName.reference).dsSelect('Sophie Salt');
    cy.get(appFrontend.changeOfName.reference).should('have.value', 'Sophie Salt');
    cy.get(appFrontend.changeOfName.reference2).dsSelect('Dole');
    cy.get(appFrontend.changeOfName.reference2).should('have.value', 'Dole');
  });

  it('is possible to build options from repeating groups', () => {
    cy.goto('group');
    cy.get(appFrontend.navMenu).should('be.visible');
    cy.get(appFrontend.nextButton).click();
    cy.get(appFrontend.group.showGroupToContinue).find('input').dsCheck();
    cy.addItemToGroup(1, 2, 'automation');
    cy.addItemToGroup(3, 4, 'altinn');
    cy.get(appFrontend.group.options).click();
    cy.findByRole('option', { name: 'Endre fra: 1, Endre til: 2' }).should('be.visible');
    cy.findByRole('option', { name: 'Endre fra: 3, Endre til: 4' }).should('be.visible');
    cy.findByRole('option', { name: 'Endre fra: 1, Endre til: 2' }).click();
    cy.get(appFrontend.group.options).should('have.value', 'Endre fra: 1, Endre til: 2');
  });

  it('is possible to use dynamic expressions in "source" when building options from repeating groups', () => {
    cy.goto('group');
    cy.get(appFrontend.navMenu).should('be.visible');
    cy.get(appFrontend.nextButton).click();

    cy.findByRole('checkbox', { name: /ja/i }).click();
    cy.addItemToGroup(1, 2, 'automation');
    cy.addItemToGroup(3, 4, 'altinn');

    cy.findAllByRole('combobox', { name: /Velg/ }).last().click();

    /**
     * This tests that a Dropdown which has added dynamic expressions for the label property
     * The expression: ["concat",["text", "optionsFromRepeatingGroup"], ["concat", " ", ["text", "question-1"]]]
     */
    cy.findByRole('option', { name: 'Endre fra: 1, Endre til: 2 Gjør du leksene dine?' }).should('be.visible');
    cy.findByRole('option', { name: 'Endre fra: 3, Endre til: 4 Gjør du leksene dine?' }).should('be.visible');
  });

  it('is possible to use dynamic expressions in "source" when building options from repeating groups with Radio buttons', () => {
    cy.goto('group');
    cy.get(appFrontend.navMenu).should('be.visible');
    cy.get(appFrontend.nextButton).click();
    cy.findByRole('checkbox', { name: /ja/i }).click();
    cy.addItemToGroup(1, 2, 'automation');
    cy.addItemToGroup(3, 4, 'altinn');

    /**
     * This tests that a RadioButtons which has added dynamic expressions for the label,
     *  description, and helpText properties. The expression:
     * ["concat",["text", "optionsFromRepeatingGroup"], ["concat", " ", ["text", "question-2"]]]
     */
    cy.findByRole('radio', { name: /endre fra: 1, endre til: 2 fungerer kalkulatoren din/i }).should('exist');
    cy.findByRole('radio', { name: /endre fra: 3, endre til: 4 fungerer kalkulatoren din/i }).should('exist');
  });

  it('mapping updates options, but does not always unselect previous options', () => {
    for (const optionsId of ['references', 'test']) {
      cy.intercept({ method: 'GET', url: `**/options/${optionsId}**` }, (req) => {
        req.reply((res) => {
          const options = res.body as IOption[];
          options.push({
            value: 'fixedValue',
            label: 'My fixed value',
          });
          res.send(JSON.stringify(options));
        });
      }).as(`interceptOptions(${optionsId})`);
    }

    cy.goto('changename');

    // All options are fetched once at first (with 'undefined' in mapping, as no value for source has been set)
    cy.get('@interceptOptions(references).all').should('have.length', 1);
    cy.get('@interceptOptions(test).all').should('have.length', 1);

    // This field uses preselectedOptionIndex to select 'Altinn'
    cy.get(appFrontend.changeOfName.sources).should('have.value', 'Altinn');

    // At that point our options have new mappings, so requests should have fired again
    cy.get('@interceptOptions(references).all').should('have.length', 2);
    cy.get('@interceptOptions(test).all').should('have.length', 2);

    cy.get(appFrontend.changeOfName.reference).dsSelect('My fixed value');
    cy.get(appFrontend.changeOfName.reference).should('have.value', 'My fixed value');
    cy.get(appFrontend.changeOfName.reference2).dsSelect('My fixed value');
    cy.get(appFrontend.changeOfName.reference2).should('have.value', 'My fixed value');

    // Selecting a new source now causes requests to fire once more with new mapping,
    // but the fixed value should stay in place as they were present in both the old and new options responses
    cy.get(appFrontend.changeOfName.sources).dsSelect('Digitaliseringsdirektoratet');
    cy.get(appFrontend.changeOfName.sources).should('have.value', 'Digitaliseringsdirektoratet');
    cy.get('@interceptOptions(references).all').should('have.length', 3);
    cy.get('@interceptOptions(test).all').should('have.length', 3);

    cy.get(appFrontend.changeOfName.reference).should('have.value', 'My fixed value');
    cy.get(appFrontend.changeOfName.reference2).should('have.value', 'My fixed value');
  });
  it.only('retrieves metadata from header when metadata is set in datamodelBindings', () => {
    const now = new Date(2023, 1, 1).getTime();
    cy.clock(now, ['Date']);

    cy.intercept({ method: 'GET', url: '**/options/**' }).as('optionsMunicipality');

    cy.goto('changename');
    cy.wait('@optionsMunicipality');
    cy.tick(1000);
    cy.get(appFrontend.changeOfName.municipalityMetadata).should(
      'have.value',
      'language=nb,id=131,variant=,date=30/12/2023,level=,parentCode=',
    );
    cy.clock().invoke('restore');
  });
});
