import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

// describe('Input component', () => {
//   it('Renders the summary2 component with correct text', () => {
//     cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
//     // fillInInputAndVerify('I type some text');
//     // cy.gotoNavPage('Kort svar');
//
//     cy.window().then((win) => {
//       const perf = win.performance;
//       const navEntry = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
//       cy.log(`TTFB: ${navEntry.responseStart - navEntry.startTime}`);
//       cy.log(`DOM Load: ${navEntry.domContentLoadedEventEnd - navEntry.startTime}`);
//       cy.log(`LCP: ${navEntry.loadEventEnd - navEntry.startTime}`);
//     });
//   });
// });

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.intercept('GET', '/api/**').as('apiCalls');
  });

  it('measures initial page load metrics', () => {
    cy.gotoNavPage('Kort svar');
    cy.window().then((win) => {
      const nav = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const metrics = {
        TTFB: nav.responseStart - nav.startTime,
        DOMContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        LoadTime: nav.loadEventEnd - nav.startTime,
      };
      cy.log(JSON.stringify(metrics, null, 2));
    });
  });

  // it('measures time to render a large form', () => {
  //   cy.gotoNavPage('Kort svar');
  //   cy.window().then((win) => win.performance.mark('form:start'));
  //
  //   cy.get('[data-cy=form-container]').should('exist');
  //   cy.window().then((win) => {
  //     win.performance.mark('form:end');
  //     win.performance.measure('formRender', 'form:start', 'form:end');
  //     const m = win.performance.getEntriesByName('formRender')[0];
  //     cy.log(`Form render: ${m.duration.toFixed(2)}ms`);
  //   });
  // });

  // it('measures expression evaluation performance', () => {
  //   cy.gotoNavPage('Kort svar');
  //   cy.get('[data-cy=input]').should('exist');
  //
  //   cy.window().then((win) => win.performance.mark('expr:start'));
  //   cy.get('[data-cy=input]').type('123');
  //   cy.get('[data-cy=field-controlled-by-expression]').should('be.visible');
  //
  //   cy.window().then((win) => {
  //     win.performance.mark('expr:end');
  //     win.performance.measure('exprEval', 'expr:start', 'expr:end');
  //     const m = win.performance.getEntriesByName('exprEval')[0];
  //     cy.log(`Expression evaluation: ${m.duration.toFixed(2)}ms`);
  //   });
  // });

  it('logs API call count and unique endpoints', () => {
    cy.gotoNavPage('Kort svar');
    cy.wait('@apiCalls');

    cy.get('@apiCalls.all').then((calls: any[]) => {
      const total = calls.length;
      const unique = [...new Set(calls.map((c) => c.request.url))].length;
      cy.log(`Total API calls: ${total}`);
      cy.log(`Unique API endpoints: ${unique}`);
    });
  });
});
