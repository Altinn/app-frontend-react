import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Grid summary test', () => {
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
  });

  it('Shows Summary2 of Grid correctly', () => {
    cy.gotoNavPage('Grid');

    const gridSummary1 = 'table[data-testid="summary-all-grid-components"]';
    const gridSummary2 = 'table[data-testid="summary-grid-example-common-fields"]';

    cy.get(`${gridSummary1} tr`).last().find('td').eq(1).should('have.text', '');
    cy.get(`${gridSummary2} tr`).eq(2).find('td').eq(1).should('have.text', '');

    cy.get('#grid-input-field-two').type('Test input field 2');
    cy.get(`${gridSummary2} tr`).eq(2).find('td').eq(1).should('have.text', 'Test input field 2');

    cy.visualTesting('grid-summary');
  });

  it('Summary2 should render null-cells as empty strings', () => {
    cy.gotoNavPage('Grid');

    cy.changeLayout((component) => {
      if (component.type === 'Grid' && component.id === 'grid-example-common-fields') {
        let counter = 0;
        for (const row of component.rows) {
          for (const cellIdx in row.cells) {
            const original = row.cells[cellIdx];
            row.cells[cellIdx] = counter++ % 3 === 0 ? original : null;
          }
        }
      }
    });

    // Asserts that all rows have the same amount of cells. There used to be a bug where the Summary2 table
    // would just skip these cells when null, but that breaks the table visual.
    const rows = [0, 1, 2, 3, 4];
    cy.findByTestId('summary-grid-example-common-fields').find('tr').should('have.length', rows.length);
    for (const rowIdx of rows) {
      cy.findByTestId('summary-grid-example-common-fields')
        .find('tr')
        .eq(rowIdx)
        .find('td,th')
        .should('have.length', 5);
    }
  });

  it('keeps row category text visible and associated with the field on mobile/400% zoom', () => {
    cy.gotoNavPage('Grid');
    cy.viewport('samsung-s10');

    // The desktop grid table should collapse into the stacked mobile view
    cy.get('#grid-example-common-fields').should('be.visible');
    cy.get('#grid-example-common-fields table').should('not.exist');

    // The column title ("Row number") is rendered as a <dt> label and the row's read-only text as its
    // <dd> value - this text used to be dropped entirely on mobile.
    cy.get('#grid-example-common-fields').find('dt').should('contain.text', 'Row number');
    cy.get('#grid-example-common-fields').find('dd').should('contain.text', 'Row 1');

    // The category text is programmatically associated with its answer field: the input lives inside a
    // group labelled by the column title + row text.
    cy.findByRole('group', { name: 'Row number Row 1' }).findByRole('textbox').should('exist');
  });
});
