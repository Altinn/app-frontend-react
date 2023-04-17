import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import { Common } from 'test/e2e/pageobjects/common';

const appFrontend = new AppFrontend();
const mui = new Common();

describe('Grid component', () => {
  it('should work with basic table functionality', () => {
    cy.goto('changename');
    cy.navPage('grid').click();

    // Dynamics hiding the entire grid table
    cy.get(appFrontend.grid.gridWithAll).should('be.visible');
    cy.get(appFrontend.grid.showGridWithAll).find('label:contains("Nei")').click();
    cy.get(appFrontend.grid.gridWithAll).should('not.exist');

    // Dynamics hiding an entire row
    cy.get(appFrontend.grid.hasCreditCard).find('label:contains("Nei")').click();
    cy.get(appFrontend.grid.grid).find('tr').should('have.length', 4);
    cy.get(appFrontend.grid.hasCreditCard).find('label:contains("Ja")').click();
    cy.get(appFrontend.grid.grid).find('tr').should('have.length', 5);

    // Filling out the form without ending up at 100% total
    cy.get(appFrontend.grid.totalAmount).type('1000000');
    cy.get(appFrontend.grid.bolig.percent).type('70');
    cy.get(appFrontend.grid.studie.percent).type('10');
    cy.get(appFrontend.grid.kredittkort.percent).type('5');
    cy.get(appFrontend.grid.totalPercent).should('have.value', '85 %');
    cy.get(appFrontend.errorReport).should('not.exist');

    // Fill out the rest of the form, so that we can attempt to send it and only get the validation message we care
    // about for Grid.
    cy.navPage('form').click();
    cy.get(appFrontend.changeOfName.newFirstName).type('first name');
    cy.get(appFrontend.changeOfName.newLastName).type('last name');
    cy.get(appFrontend.changeOfName.confirmChangeName).find('input').dsCheck();
    cy.get(appFrontend.changeOfName.reasonRelationship).click();
    cy.get(appFrontend.changeOfName.reasonRelationship).type('hello world');
    cy.get(appFrontend.changeOfName.dateOfEffect).siblings().children(mui.buttonIcon).click();
    cy.get(mui.selectedDate).click();
    cy.navPage('grid').click();

    // Validation error should be displayed in the error report and along with the totalAmount field
    cy.get(appFrontend.sendinButton).click();
    cy.get(appFrontend.errorReport).should('contain.text', 'Må summeres opp til 100%');
    cy.get(appFrontend.grid.totalPercent).parents('td').should('contain.text', 'Må summeres opp til 100%');
  });
});
