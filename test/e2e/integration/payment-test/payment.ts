import 'cypress-iframe';

import { faker } from '@faker-js/faker';

import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
const appFrontend = new AppFrontend();

let paymentUrl: string;

describe('Payment', () => {
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.paymentTest, { authenticationLevel: '2' });
  });

  it('Should fill out the form, landing on the payment page', () => {
    cy.findByRole('radio', { name: /Jeg fyller ut skjemaet som søker/ }).click();
    cy.contains('button', 'Betalning og saksgangen vidare').click();
    cy.findByRole('button', { name: /Til betaling/ }).click();
    cy.intercept({
      method: 'GET', // Assuming it's a GET request; adjust if otherwise
      url: '**/ttd/payment-test/instances/**/**/payment',
    }).as('paymentInfoRequest');

    cy.wait('@paymentInfoRequest').then((_) => {
      cy.url().then((url) => {
        cy.log(`Current URL is: ${url}`);
        paymentUrl = url;
      });
    });

    cy.enter('#nets-checkout-iframe').then((getBody) => {
      getBody().find('#registrationManualEmail').should('be.visible').type(faker.internet.email());
      getBody().find('#registrationManualPostalCode').should('be.visible').type('2072');
      getBody().find('#registrationManualPhoneNumber').should('not.be.disabled').type('94257166');
      getBody().find('#registrationManualFirstName').should('not.be.disabled').type(faker.person.firstName());
      getBody().find('#registrationManualLastName').should('not.be.disabled').type(faker.person.firstName());
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

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(4000);
    cy.enter('#nets-checkout-iframe').then((getBody) => {
      getBody().find('#btnPay').should('exist').click();
    });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(4000);

    cy.enter('#nets-checkout-iframe').then((getBody) => {
      cy.frameLoaded('#nets-checkout-iframe')
        .iframeCustom()
        .find('#nets-checkout-inception-iframe')
        .iframeCustom()
        .find('#AuthenticationSuccessButton')
        .click();
    });
    cy.intercept({
      method: 'GET', // Assuming it's a GET request; adjust if otherwise
      url: '**/ttd/payment-test/*',
      query: {
        paymentid: '*',
      },
    }).as('paymentRequest');

    cy.wait('@paymentRequest').then((interception) => {
      expect(interception?.response?.statusCode).to.eq(302);
    });
  });

  it('Should fill out the form, landing on the payment page', () => {
    cy.visit(paymentUrl);
    cy.contains('span', 'Du har betalt!').should('exist');
  });
});
