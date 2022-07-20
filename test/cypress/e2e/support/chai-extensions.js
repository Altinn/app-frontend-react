export default _chai => {

  /**
   * @see https://www.webtips.dev/webtips/cypress/check-if-element-is-in-viewport
   */
  function assertIsInViewport() {
    const subject = this._obj;

    const bottom = Cypress.$(cy.state('window')).height();
    const width = Cypress.$(cy.state('window')).width();
    const rect = subject[0].getBoundingClientRect();

    this.assert(
      rect.top < bottom && rect.right <= width && rect.left >= 0,
      'expected #{this} to be in the viewport',
      'expected #{this} to not be in the viewport',
      this._obj
    );
  }

  _chai.Assertion.addMethod('inViewport', assertIsInViewport);
};
