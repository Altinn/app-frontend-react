describe('Tabs', () => {
  beforeEach(() => {
    cy.goto('changename');
    cy.navPage('tabs').click();
  });

  it('Displays the correct tabs and default tab content', () => {
    cy.findByRole('tablist').children().should('have.length', 2);

    const tab1 = /Tab 1/i;
    cy.findByRole('tab', { name: tab1 }).invoke('attr', 'aria-selected').should('equal', 'true');
    cy.findByRole('tab', { name: tab1 }).findByAltText('Tab 1'); // Check if icon is present
    cy.findByRole('tab', { name: tab1 }).should('have.text', 'Tab 1'); // check if text is present

    cy.findByRole('tab', { name: 'Tab 2' });

    cy.get('p').should('contain.text', 'Paragraph 1');
    cy.findByRole('tabpanel').should('contain.text', 'Paragraph 1');
  });

  it('Displays the correct tab content when clicking on a tab', () => {
    cy.findByRole('tablist').children().should('have.length', 2);
    cy.findByRole('tab', { name: 'Tab 2' }).invoke('attr', 'aria-selected').should('equal', 'false');

    cy.findByRole('tab', { name: 'Tab 2' }).click();
    cy.findByRole('tab', { name: 'Tab 2' }).invoke('attr', 'aria-selected').should('equal', 'true');
    cy.findByRole('tabpanel').findByRole('textbox').should('exist');
  });

  it('Navigates to the correct tab when clicking on a validation error of an input field in that tab', () => {
    cy.findByRole('tablist').children().should('have.length', 2);
    cy.findByRole('tab', { name: 'Tab 2' }).invoke('attr', 'aria-selected').should('equal', 'false');

    //TODO: Må opprette egen datamodel attributt for input felt for å trigge validering ved send inn knapp. Så kommentere inn resten av koden under.

    //cy.findByText('Feltet er påkrevd (fra backend)').click();
    //cy.findByRole('tab', { name: 'Tab 2' }).invoke('attr', 'aria-selected').should('equal', 'true');
    //cy.findByRole('tabpanel').findByRole('textbox').should('exist');
  });
});
