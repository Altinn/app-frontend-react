describe('Number component', () => {
  it('should render correctly', () => {
    cy.goto('changename');

    cy.findByRole('checkbox', { name: /cards/i }).check();
    cy.gotoNavPage('cards');
    const numberCard = '[data-componentid="number-Card"]';
    cy.get(numberCard).findAllByRole('term'); // .findByText('Total gjeld').and('eq', 'number-Card');
    cy.get(numberCard)
      .findAllByRole('term')
      .should((terms) => {
        expect(terms.eq(0).text()).to.equal('Total gjeld');
        expect(terms.eq(1).text()).to.equal('Statisk verdi som tall');
        expect(terms.eq(2).text()).to.equal('Kredittkort prosent');
        expect(terms.eq(3).text()).to.equal('Statisk verdi med desimal');
      });

    cy.get(numberCard)
      .findAllByRole('definition')
      .should((definitions) => {
        expect(definitions.eq(0).text()).to.equal('0 kr');
        expect(definitions.eq(1).text()).to.equal('2 000 kr');
        expect(definitions.eq(2).text()).to.equal('0 %');
        expect(definitions.eq(3).text()).to.equal('20 000,2 kr');
      });
  });
});
