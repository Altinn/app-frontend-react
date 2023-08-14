describe('Accordion', () => {
  it('Displays the containing information when the Accordion title is clicked', () => {
    cy.goto('changename');

    const accordionContent = /in horas tendebat resumptis/i;

    cy.findAllByText(accordionContent).first().should('not.be.visible');
    cy.findByRole('button', { name: /mer informasjon vedrørende navneendring/i }).click();
    cy.findAllByText(accordionContent).first().should('be.visible');
  });
});
