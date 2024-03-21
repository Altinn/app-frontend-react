import 'cypress-iframe';

import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
const appFrontend = new AppFrontend();

describe('Payment', () => {
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.paymentTest, { authenticationLevel: '2' });
    // cy.clearCookies();
    // cy.clearLocalStorage();
  });

  it('Should fill out the form, landing on the payment page', () => {
    cy.findByRole('radio', { name: /Jeg fyller ut skjemaet som søker/ }).click();
    cy.contains('button', 'Betalning og saksgangen vidare').click();
    cy.findByRole('button', { name: /Til betaling/ }).click();
    cy.contains('button', 'Pay!').should('be.visible').click();

    cy.enter('#nets-checkout-iframe').then((getBody) => {
      getBody().find('#registrationManualEmail').should('be.visible').type('adam@example.com');
      getBody().find('#registrationManualPostalCode').should('be.visible').type('2072');
      getBody().find('#registrationManualPhoneNumber').should('not.be.disabled').type('94257166');
      getBody().find('#registrationManualFirstName').should('not.be.disabled').type('Terje');
      getBody().find('#registrationManualLastName').should('not.be.disabled').type('Håkonsen');
      getBody().find('#registrationManualAddressLine1').should('not.be.disabled').type('Grev Wedels plass 1');

      getBody().find('#registrationManualCity').should('not.be.disabled').type('Oslo');
    });

    cy.frameLoaded('#nets-checkout-iframe')
      .iframeCustom()
      .find('#easy-checkout-iframe')
      .iframeCustom()
      .find('#cardNumberInput')
      .type('4268270087374847');

    cy.frameLoaded('#nets-checkout-iframe')
      .iframeCustom()
      .find('#easy-checkout-iframe')
      .iframeCustom()
      .find('#cardExpiryInput')
      .type('1059');

    cy.frameLoaded('#nets-checkout-iframe')
      .iframeCustom()
      .find('#easy-checkout-iframe')
      .iframeCustom()
      .find('#cardCvcInput')
      .type('123');

    // cy.wait(1000);
    cy.enter('#nets-checkout-iframe').then((getBody) => {
      getBody().find('#btnPay').should('exist').click();
    });
    // cy.wait(2000);

    cy.enter('#nets-checkout-iframe').then((getBody) => {
      // cy.frameLoaded('#nets-checkout-inception-iframe')
      //   .iframeCustom()
      //   .find('#AuthenticationSuccessButton')
      //   .should('be.visible')
      //   .click();

      cy.frameLoaded('#nets-checkout-iframe')
        .iframeCustom()
        .find('#nets-checkout-inception-iframe')
        .iframeCustom()
        .find('#AuthenticationSuccessButton')
        .click();
    });
    // cy.wait(5000);
    cy.get('[presentation-heading]').should('be.visible');
  });
});
