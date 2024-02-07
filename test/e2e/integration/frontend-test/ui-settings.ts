import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Expanded width', () => {
  it('Shows page with expandedWidth as expanded', () => {
    cy.intercept('GET', '**/api/layoutsettings/changename', {
      statusCode: 200,
      body: {
        $schema: 'https://altinncdn.no/schemas/json/layout/layoutSettings.schema.v1.json',
        pages: {
          order: ['form', 'summary', 'grid'],
          excludeFromPdf: ['summary'],
          showLanguageSelector: true,
          expandedWidth: ['grid'],
        },
        components: {
          excludeFromPdf: ['confirmChangeName'],
        },
      },
    });
    cy.goto('changename');
    cy.get(appFrontend.notExpandedWidth).should('exist');

    cy.gotoNavPage('grid');
    cy.get(appFrontend.expandedWidth).should('exist');
  });
});
