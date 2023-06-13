import escapeRegex from 'escape-string-regexp';

import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import JQueryWithSelector = Cypress.JQueryWithSelector;

const appFrontend = new AppFrontend();

Cypress.Commands.add('assertTextWithoutWhiteSpaces', { prevSubject: true }, (subject, expectedText) => {
  const normalWhiteSpace = (subject[0].value || ' ').replace(/\u00a0/g, ' ');
  expect(normalWhiteSpace).to.equal(expectedText || ' ');
});

Cypress.Commands.add('isVisible', { prevSubject: true }, (subject) => {
  const isVisible = (elem) => !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
  expect(isVisible(subject[0])).to.be.true;
});

Cypress.Commands.add('dsCheck', { prevSubject: true }, (subject: JQueryWithSelector | undefined) => {
  cy.log('Checking');
  if (subject && !subject.is(':checked')) {
    cy.wrap(subject).parent().click();
  }
});

Cypress.Commands.add('dsUncheck', { prevSubject: true }, (subject: JQueryWithSelector | undefined) => {
  cy.log('Unchecking');
  if (subject && subject.is(':checked')) {
    cy.wrap(subject).parent().click();
  }
});

Cypress.Commands.add('dsSelect', { prevSubject: true }, (subject: JQueryWithSelector | undefined, name) => {
  cy.log(`Selecting ${name}`);
  cy.wrap(subject).click();
  cy.findByRole('option', { name }).click();
  cy.get('body').click();
  cy.wrap(subject);
});

Cypress.Commands.add('clickAndGone', { prevSubject: true }, (subject: JQueryWithSelector | undefined) => {
  // eslint-disable-next-line cypress/unsafe-to-chain-command
  cy.wrap(subject).click().should('not.exist');
});

Cypress.Commands.add('navPage', (page: string) => {
  cy.window().then((win) => {
    const pageAsRegex = escapeRegex(page);
    const regex = new RegExp(`^([0-9]+. )?${pageAsRegex}$`);

    if (win.innerWidth < 768) {
      cy.get(appFrontend.navMobileMenu).should('have.attr', 'aria-expanded', 'false').click();
    }
    cy.get(appFrontend.navMenu).findByText(regex);
  });
});

Cypress.Commands.add('gotoNavPage', (page: string) => {
  cy.navPage(page).click();
  cy.navPage(page).should('have.attr', 'aria-current', 'page');
});

Cypress.Commands.add('numberFormatClear', { prevSubject: true }, (subject: JQueryWithSelector | undefined) => {
  cy.log('Clearing number formatted input field');
  if (!subject) {
    throw new Error('Subject is undefined');
  }

  // Since we cannot use {selectall} on number formatted input fields, because react-number-format messes with
  // our selection, we need to delete the content by moving to the start of the input field and deleting one
  // character at a time.
  const strLength = subject.val()?.toString().length;
  const del = new Array(strLength).fill('{del}').join('');

  // We also add {moveToStart} multiple times to ensure that we are at the start of the input field, as
  // react-number-format messes with our cursor position here as well.
  const moveToStart = new Array(5).fill('{moveToStart}').join('');

  cy.wrap(subject).type(`${moveToStart}${del}`);
});

Cypress.Commands.add('snapshot', (name: string) => {
  cy.get('#readyForPrint').should('exist');

  cy.log('Taking snapshot with Percy');
  cy.percySnapshot(name, {
    percyCSS: `
      /* This snippet allows us to add a class to hide some elements from the visual testing. This class should be
       * added on elements that change for every test, such as dates, times, random strings (such as the instance UUID)
       * and other elements that would interfere and cause unnecessary visual diffs.
       */
      .no-visual-testing {
        color: black !important;
        background-color: black !important;
        border: none !important;
        box-shadow: none !important;
        text-shadow: none !important;
        outline: none !important;
        opacity: 1 !important;
     }
     /* This mitigates a problem where our DeleteWarningPopover (and potentially other components using radix popper)
      * is not displayed in the correct location in the snapshot. It seems the radix popover is positioned actively
      * using javascript, which is not passed on to Percy. This workaround positions the popover in a spot where it
      * is visible, instead of defaulting to being buried under our app header (with a higher z-index).
      */
     [data-radix-popper-content-wrapper] {
        left: 100px !important;
        top: 150px !important;
        position: fixed !important;
        transform: none !important;
     }
   `,
    discovery: {
      allowedHostnames: ['localhost', 'localhost:8080'],
    },
  });

  /*
   * TODO: Enable this again later, when we have fixed all the accessibility issues in current tests.
   *
   *
  cy.log('Testing WCAG');
  cy.injectAxe();
  cy.checkA11y(undefined, {
    includedImpacts: ['critical', 'serious', 'moderate'],
  });
   */
});
