describe('Number component', () => {
  it('should render correctly', () => {
    cy.goto('changename');

    cy.findByRole('checkbox', { name: /cards/i }).check();
    cy.gotoNavPage('cards');
    const numberCard = '[data-componentid="number-Card"]';

    cy.get(numberCard).findByText(/total gjeld/i);
    cy.get(numberCard).findByLabelText(/total gjeld/i);

    cy.get(numberCard).findByText(/Statisk verdi som tall/i);
    cy.get(numberCard).findByLabelText(/Statisk verdi som tall/i);

    cy.get(numberCard).findByText(/Kredittkort prosent/i);
    cy.get(numberCard).findByLabelText(/Kredittkort prosent/i);

    cy.get(numberCard).findAllByText(/Statisk verdi med desimal/i);
    cy.get(numberCard).findByLabelText(/statisk verdi med desimal/i);
  });
});
