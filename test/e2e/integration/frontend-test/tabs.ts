describe('Tabs', () => {
  beforeEach(() => {
    cy.goto('changename');
    cy.navPage('tabs').click();
  });

  it('Displays the correct tabs and default tab content', () => {
    cy.findByRole('tablist').children().should('have.length', 2);
    cy.findByRole('tab', { name: 'Tab 1 Tab 1' }); // FIXME: Should only be 'Tab 1'?
    cy.findByRole('tab', { name: 'Tab 2' });

    cy.get('p').should('contain.text', 'Paragraph 1');
    cy.findByRole('tabpanel').should('contain.text', 'Paragraph 1');
  });

  it('Displays the correct tab content when clicking on a tab', () => {
    cy.findByRole('tab', { name: 'Tab 2' }).click();
    cy.findByRole('tabpanel');

    cy.findByRole('textbox').should('exist');
    // TODO: finish
  });
  it('Navigates to the correct tab when clicking on a validation error of an input field in that tab', () => {});
});
