import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Expanded width', () => {
  it('Shows page with expandedWidth as expanded', () => {
    cy.interceptLayout(
      'layouts',
      () => {},
      (layoutSet) => {
        layoutSet.grid.data.expandedWidth = true;
      },
    );
    cy.goto('changename');
    cy.get(appFrontend.notExpandedWidth).should('exist');

    cy.gotoNavPage('grid');
    cy.get(appFrontend.expandedWidth).should('exist');
  });
});
