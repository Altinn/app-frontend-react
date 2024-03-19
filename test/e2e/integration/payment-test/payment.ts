import 'cypress-iframe';

import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
const appFrontend = new AppFrontend();

const getIframeDocument = () =>
  cy
    .get('iframe[id="nets-checkout-iframe"]')
    // Cypress yields jQuery element, which has the real
    // DOM element under property "0".
    // From the real DOM iframe element we can get
    // the "document" element, it is stored in "contentDocument" property
    // Cypress "its" command can access deep properties using dot notation
    // https://on.cypress.io/its
    .its('0.contentDocument')
    .should('exist');

const getIframeBody = () =>
  // get the document
  getIframeDocument()
    // automatically retries until body is loaded
    .its('body')
    .should('not.be.undefined')
    // wraps "body" DOM element to allow
    // chaining more Cypress commands, like ".find(...)"
    .then(cy.wrap);

describe('Payment', () => {
  // beforeEach(() => {
  //   cy.startAppInstance(appFrontend.apps.paymentTest);
  // });
  //
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.paymentTest, { authenticationLevel: '2' });
    // cy.intercept('**/active', []).as('noActiveInstances');
    // cy.intercept('POST', `**/instances?instanceOwnerPartyId*`).as('createInstance');
  });

  it('Should fill out the form, landing on the payment page', () => {
    // cy.findByRole('radio', { name: 'radiogroup-name-:r4h:' }).click();

    cy.findByRole('radio', { name: /Jeg fyller ut skjemaet som søker/ }).click();

    // cy.get('[data-testid="NavigationBar"]').find("button:contains('Betalning og saksgangen vidare')").click;

    // cy.contains('button', 'Betalning og saksgangen vidare').click();
    cy.contains('button', 'Betalning og saksgangen vidare').click();

    cy.findByRole('button', { name: /Til betaling/ }).click();

    // const routeRegex = new RegExp('/instances/*/*/payment');

    //local.altinn.cloud/ttd/payment-test/instances/512345/3cc81e00-6b98-4353-a2b4-3b426a862593/payment

    // cy.intercept('GET', routeRegex).as('getData');
    //
    // cy.wait('@getData');

    // cy.findByRole('button', { name: /Pay!/ }).click();

    cy.contains('button', 'Pay!').should('be.visible').click();

    // cy.frameLoaded({ url: 'https://test.checkout.dibspayment.eu' });
    //
    // cy.iframe().find('#registrationManualEmail').should('be.visible').type('adam@example.com');

    // cy.iframe('iframeSelector').then((iframe) => {
    //   // Now, you are inside the nested iframe
    //   // Perform actions or assertions within the iframe
    //   iframe.find('input').type('Text to type');
    // });

    // cy.iframe('#nets-checkout-iframe').then((initialIframe) => {
    //   // initialIframe.find('#registrationManualEmail').should('be.visible').type('adam@example.com');
    //   // initialIframe.find('#registrationManualPostalCode').should('be.visible').type('2072');
    //   // initialIframe.find('#registrationManualPhoneNumber').should('not.be.disabled').type('94257166');
    //   // initialIframe.find('#registrationManualFirstName').should('not.be.disabled').type('Terje');
    //   // initialIframe.find('#registrationManualLastName').should('not.be.disabled').type('Håkonsen');
    //   // initialIframe.find('#registrationManualAddressLine1').should('not.be.disabled').type('Grev Wedels plass 1');
    //
    //   // @ts-ignore
    //   initialIframe.within(() => {
    //     cy.iframe('nestedIframeSelector').then((nestedIframe) => {
    //       // Now, you are inside the nested iframe
    //       // Perform actions or assertions within the nested iframe
    //       nestedIframe.find('input').type('Text to type');
    //     });
    //   });

    // cy.get('#nets-checkout-iframe').then(($firstIframe) => {
    //   const $secondIframeReference = $firstIframe.contents().find('#easy-checkout-iframe');
    //
    //   cy.log('$secondIframeReference', $secondIframeReference);
    //
    //   cy.wrap($secondIframeReference).as('secondIframeReference'); // Saving this as a reference so we can access it again using get command
    //
    //   // Now we are accessing the second iframe
    //   cy.get('@secondIframeReference').then(($secondIframe) => {
    //     const $elementYouWant = $secondIframe.contents().find('element you want to interact with');
    //
    //     cy.wrap($elementYouWant).type('4268270087374847'); // In case it is an input field, for example
    //   });
    // });

    cy.enter('#nets-checkout-iframe').then((getBody) => {
      getBody().find('#registrationManualEmail').should('be.visible').type('adam@example.com');
      getBody().find('#registrationManualPostalCode').should('be.visible').type('2072');
      getBody().find('#registrationManualPhoneNumber').should('not.be.disabled').type('94257166');
      getBody().find('#registrationManualFirstName').should('not.be.disabled').type('Terje');
      getBody().find('#registrationManualLastName').should('not.be.disabled').type('Håkonsen');
      getBody().find('#registrationManualAddressLine1').should('not.be.disabled').type('Grev Wedels plass 1');

      getBody().debug();
      // getBody().frameLoaded('#easy-checkout-iframe').should('be.visible');

      // cy.log(getBody());
      //getBody().iframe().debug();
      // getBody()
      //   .find('#easy-checkout-iframe')
      //   .should('be.visible')
      //   .should('not.be.empty')
      //   .then(($iframe) => $iframe.contents().find('body'));

      //const $secondIframeReference =
      //getBody().iframe().find('#cardNumberInput');
      // .should('not.be.disabled')
      // .type('4268270087374847');

      // cy.enter().then((getBody) => {
      //   getBody().find('#cardNumberInput').should('not.be.disabled').type('4268270087374847');
      //   getBody().find('#cardExpiryInput').should('be.visible').type('1159');
      //   getBody().find('#cardVerificationCode').should('be.visible').type('123');
      //   getBody().find('#btnPay').should('be.visible').click();
      // });
    });

    // cy.frameLoaded('#nets-checkout-iframe').then(($frame) => {
    //   const contentWindow: Window = $frame.prop('contentWindow');
    // });

    // cy.get('#nets-checkout-iframe')
    //   .its('contentWindow')
    //   .should('exist')
    //   //.then(cy.wrap)
    //   .find('#registrationManualEmail')
    //   .should('be.visible')
    //   .type('adam@example.com');

    // .get('#nets-checkout-iframe')
    // .its('0.contentDocument')
    // .should('exist');

    // cy.enter('#nets-checkout-iframe')
    //   //.enter('#easy-checkout-iframe')
    //   .then((getBody) => {
    //     getBody().get('#easy-checkout-iframe').its('0.contentDocument');
    //     //getBody().find('#cardNumberInput');
    //   });
    // cy.get('#nets-checkout-iframe').then(($firstIframe) => {
    //   const $secondIframeReference = $firstIframe.contents().find('#easy-checkout-iframe');
    //
    //   cy.wrap($secondIframeReference).as(''); // Saving this as a reference so we can access it again using get command
    //
    //   // Now we are accessing the second iframe
    //   cy.get('#easy-checkout-iframe').then(($secondIframe) => {
    //     const $elementYouWant = $secondIframe.contents().find('#cardNumberInput');
    //     cy.wrap($elementYouWant).type('4268270087374847'); // In case it is an input field, for example
    //   });
    // });

    // initialIframe
    //   .within()('easy-checkout-iframe')
    //   .then((nestedIframe) => {
    //     // Now, you are inside the nested iframe
    //     // Perform actions or assertions within the nested iframe
    //     nestedIframe.find('#cardNumberInput').should('not.be.disabled').type('4268270087374847');
    //   });
    // });

    //4268270087374847

    // cy.visit('/your-checkout-page');

    // cy.getIframeBody().get('#registrationManualEmail').type('4268270087374847');

    // getIframeBody().find('#registrationManualEmail').type('4268270087374847');

    //getIframeBody().find('#registrationManualEmail').should('exist'); //.type('adamgullerud@gmail.com');

    // cy.iframe('iframe[name="my-iframe"]').then((iframe) => {
    //   iframe.find('.some-element-inside-iframe').click();
    // });

    // cy.get('iframe#nets-checkout-iframe').then(($iframe) => {
    //   // Get the document of the iframe
    //   const iframeDoc = $iframe.contents()[0] as Document;
    //
    //   // Interact with elements within the iframe
    //   const inputField = iframeDoc.getElementById('registrationManualEmail') as HTMLInputElement;
    //   inputField.value = 'test@example.com';
    //   //inputField.value = '1234567890123456';
    // });

    // Fill out the postal code field
    // cy.get('#registrationManualPostalCode').type('12345');
    //
    // // Fill out other fields as needed...
    //
    // // Click on the "Add card" option
    // cy.get('#addCard').click();
    //
    // // Fill out the card number
    // cy.get('#CreditCardNumber').type('1234567890123456');
    //
    // // Fill out the expiry date
    // cy.get('#text-box').eq(0).type('1223'); // Assuming format is MMYY
    //
    // // Fill out the CVC
    // cy.get('#text-box').eq(1).type('123');
    //
    // // Check the "Save my card" checkbox
    // cy.get('#consentToSaveCard').check();
    //
    // // Click on the "Pay" button
    // cy.get('#btnPay').click();
    //
    // // Optionally, you can assert that certain elements exist after the form submission
    // cy.contains('Your payment was successful').should('exist');

    // cy.get('iframe').then(($iframe) => {
    //   const iframeDoc = $iframe.contents().find('body');
    //
    //   const emailInput = iframeDoc.find('input#registrationManualEmail') as HTMLInputElement; // .type('example@example.com');
    //
    //
    // });

    // Fill out the email field

    // cy.get('button').should('be.visible').contains('Button Text').click();
    // const accordionContent = /in horas tendebat resumptis/i;
    //
    // cy.findByText(accordionContent).should('not.be.visible');
    // cy.findByRole('button', { name: /mer informasjon vedrørende navneendring/i }).click();
    // cy.findByText(accordionContent).should('be.visible');
    // cy.get('[data-testid="Input-yHdmS6-default"]').type('Your text here');
    //
    // cy.get('[data-testid="Input-yHdmS6-default"]').should('have.value', 'Your text here');
  });
});
