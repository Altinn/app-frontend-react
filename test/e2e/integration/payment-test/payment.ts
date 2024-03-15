describe('Payment', () => {
  it('Should fill out the form, landing on the payment page', () => {
    // const accordionContent = /in horas tendebat resumptis/i;
    //
    // cy.findByText(accordionContent).should('not.be.visible');
    // cy.findByRole('button', { name: /mer informasjon vedrørende navneendring/i }).click();
    // cy.findByText(accordionContent).should('be.visible');

    cy.get('[data-testid="Input-yHdmS6-default"]').type('Your text here');

    cy.get('[data-testid="Input-yHdmS6-default"]').should('have.value', 'Your text here');
  });
});
