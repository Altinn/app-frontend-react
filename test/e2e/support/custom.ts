import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import JQueryWithSelector = Cypress.JQueryWithSelector;
import deepEqual from 'fast-deep-equal';
import type axe from 'axe-core';
import type { Options as AxeOptions } from 'cypress-axe';

import { breakpoints } from 'src/hooks/useIsMobile';
import type { ILayouts } from 'src/layout/layout';

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
    if (win.innerWidth < 768) {
      cy.get(appFrontend.navMobileMenu).should('have.attr', 'aria-expanded', 'false').click();
    }
    cy.get(appFrontend.navMenu).findByText(page).parent();
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

interface KnownViolation extends Pick<axe.Result, 'id' | 'help' | 'description' | 'impact'> {
  snapshotName: string;
  currentTest: string;
  nodeLength: number;
}

// TODO: Fix all violations and remove this list
const knownWcagViolations: KnownViolation[] = [
  {
    snapshotName: 'grid',
    currentTest: 'should work with basic table functionality',
    id: 'list',
    impact: 'serious',
    description: 'Ensures that lists are structured correctly',
    help: '<ul> and <ol> must only directly contain <li>, <script> or <template> elements',
    nodeLength: 1,
  },
  {
    snapshotName: 'group:validation',
    currentTest: 'Validation on group',
    id: 'color-contrast',
    impact: 'serious',
    description:
      'Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds',
    help: 'Elements must meet minimum color contrast ratio thresholds',
    nodeLength: 1,
  },
  {
    snapshotName: 'group:validation',
    currentTest: 'Validation on group',
    id: 'list',
    impact: 'serious',
    description: 'Ensures that lists are structured correctly',
    help: '<ul> and <ol> must only directly contain <li>, <script> or <template> elements',
    nodeLength: 1,
  },
  {
    snapshotName: 'group: delete-warning-popup',
    currentTest: 'Opens delete warning popup when alertOnDelete is true and deletes on confirm',
    id: 'aria-dialog-name',
    impact: 'serious',
    description: 'Ensures every ARIA dialog and alertdialog node has an accessible name',
    help: 'ARIA dialog and alertdialog nodes should have an accessible name',
    nodeLength: 1,
  },
];

Cypress.Commands.add('snapshot', (name: string) => {
  cy.get('#readyForPrint').should('exist');

  cy.window().then((win) => {
    // Find focused element and blur it, to ensure that we don't get any focus outlines or styles in the snapshot.
    const focused = win.document.activeElement;
    if (focused && 'blur' in focused && typeof focused.blur === 'function') {
      focused.blur();
    }

    const { innerWidth, innerHeight } = win;
    cy.readFile('test/percy.css').then((percyCSS) => {
      cy.log(`Taking snapshot with Percy: ${name}`);

      // We need to manually resize the viewport to ensure that the snapshot is taken with the correct DOM. We sometimes
      // change the DOM based on the viewport size, and Percy only understands CSS media queries (not our React logic).
      const viewportSizes = {
        desktop: { width: 1280, height: 768 },
        tablet: { width: breakpoints.tablet - 5, height: 1024 },
        mobile: { width: 360, height: 768 },
      };
      for (const [viewport, { width, height }] of Object.entries(viewportSizes)) {
        cy.viewport(width, height);
        cy.get(`html.viewport-is-${viewport}`).should('be.visible');
        cy.percySnapshot(`${name} (${viewport})`, { percyCSS, widths: [width] });
      }

      // Reset to original viewport
      cy.viewport(innerWidth, innerHeight);
      const targetViewport =
        innerWidth < breakpoints.mobile ? 'mobile' : innerWidth < breakpoints.tablet ? 'tablet' : 'desktop';
      cy.get(`html.viewport-is-${targetViewport}`).should('be.visible');
    });
  });

  cy.log('Testing WCAG');
  const axeOptions: AxeOptions = {
    includedImpacts: ['critical', 'serious', 'moderate'],
  };
  const violationsCallback = (violations: axe.Result[]) => {
    const filteredKnown = knownWcagViolations.filter(
      (known) => known.snapshotName === name && known.currentTest === Cypress.currentTest.title,
    );

    let foundNewViolations = false;
    let foundKnownViolations = 0;
    for (const violation of violations) {
      const asKnown: KnownViolation = {
        id: violation.id,
        impact: violation.impact,
        snapshotName: name,
        currentTest: Cypress.currentTest.title,
        description: violation.description,
        help: violation.help,
        nodeLength: violation.nodes.length,
      };
      const isKnown = filteredKnown.some((known) => deepEqual(known, asKnown));
      if (isKnown) {
        cy.log(`Ignoring known WCAG violation: ${violation.id}`);
        foundKnownViolations++;
        continue;
      }

      if (!foundNewViolations) {
        cy.log('-----------------------------------');
        cy.log('Found new WCAG violations:');
        cy.log(`snapshotName: ${name}`);
        cy.log(`currentTest: ${Cypress.currentTest.title}`);
      }
      cy.log('-----------------------------------');
      cy.log(`id: ${violation.id}`);
      cy.log(`impact: ${violation.impact}`);
      cy.log(`descr: ${violation.description}`);
      cy.log(`help: ${violation.help}`);
      cy.log(`helpUrl: ${violation.helpUrl}`);
      cy.log(`nodeLength: ${violation.nodes.length}`);
      foundNewViolations = true;
    }

    if (foundNewViolations) {
      cy.log('-----------------------------------');

      // Forcing a failure here, as long as skipFailures is true, to ensure that we don't miss any new WCAG violations.
      cy.get('#element-does-not-exist').should('exist');
    } else if (foundKnownViolations !== filteredKnown.length) {
      cy.log(
        `Expected to find ${filteredKnown.length} known WCAG violations, but found ${foundKnownViolations} in this test`,
      );
      cy.get('#element-does-not-exist').should('exist');
    }
  };
  const skipFailures = true; // TODO: Remove this when we have fixed all WCAG violations
  cy.checkA11y(undefined, axeOptions, violationsCallback, skipFailures);
});

Cypress.Commands.add('reloadAndWait', () => {
  cy.reload();
  cy.get('#readyForPrint').should('exist');
});

Cypress.Commands.add(
  'addItemToGroup',
  (oldValue: number, newValue: number, comment: string, openByDefault?: boolean) => {
    if (!openByDefault) {
      cy.get(appFrontend.group.addNewItem).click();
    }

    cy.get(appFrontend.group.currentValue).type(`${oldValue}`);
    cy.get(appFrontend.group.currentValue).blur();
    cy.get(appFrontend.group.newValue).type(`${newValue}`);
    cy.get(appFrontend.group.newValue).blur();
    cy.get(appFrontend.group.mainGroup)
      .find(appFrontend.group.editContainer)
      .find(appFrontend.group.next)

      .click();

    if (openByDefault || typeof openByDefault === 'undefined') {
      cy.get(appFrontend.group.addNewItemSubGroup).should('not.exist');
    } else {
      cy.get(appFrontend.group.addNewItemSubGroup).click();
    }

    cy.get(appFrontend.group.comments).type(comment);
    cy.get(appFrontend.group.comments).blur();
    cy.get(appFrontend.group.saveSubGroup).clickAndGone();
    cy.get(appFrontend.group.saveMainGroup).clickAndGone();
  },
);

Cypress.Commands.add('startStateFullFromStateless', () => {
  cy.intercept('POST', '**/instances/create').as('createInstance');
  cy.intercept('**/api/layoutsettings/statefull').as('getLayoutSettings');
  cy.get(appFrontend.instantiationButton).click();
  cy.wait('@createInstance').its('response.statusCode').should('eq', 201);
  cy.wait('@getLayoutSettings');
});

Cypress.Commands.add('getReduxState', (selector) =>
  cy
    .window()
    .its('reduxStore')
    .invoke('getState')
    .then((state) => {
      if (selector) {
        return selector(state);
      }

      return state;
    }),
);

Cypress.Commands.add('reduxDispatch', (action) => cy.window().its('reduxStore').invoke('dispatch', action));

Cypress.Commands.add('interceptLayout', (taskName, mutator, wholeLayoutMutator) => {
  cy.intercept({ method: 'GET', url: `**/api/layouts/${taskName}`, times: 1 }, (req) => {
    req.reply((res) => {
      const set = JSON.parse(res.body);
      if (mutator) {
        for (const layout of Object.values(set)) {
          (layout as any).data.layout.map(mutator);
        }
      }
      if (wholeLayoutMutator) {
        wholeLayoutMutator(set);
      }
      res.send(JSON.stringify(set));
    });
  }).as(`interceptLayout(${taskName})`);
});

Cypress.Commands.add('changeLayout', (mutator, wholeLayoutMutator) => {
  cy.window().then((win) => {
    const state = win.reduxStore.getState();
    const layouts: ILayouts = structuredClone(state.formLayout.layouts || {});
    if (mutator && layouts) {
      for (const layout of Object.values(layouts)) {
        for (const component of layout || []) {
          mutator(component);
        }
      }
    }
    if (wholeLayoutMutator) {
      wholeLayoutMutator(layouts);
    }
    win.reduxStore.dispatch({
      type: 'formLayout/updateLayouts',
      payload: layouts,
    });
  });
});

Cypress.Commands.add('interceptLayoutSetsUiSettings', (uiSettings) => {
  cy.intercept('GET', '**/api/layoutsets', (req) => {
    req.continue((res) => {
      const body = JSON.parse(res.body);
      res.body = JSON.stringify({
        ...body,
        uiSettings: { ...body.uiSettings, ...uiSettings },
      });
    });
  }).as('layoutSets');
});
