import dotenv from 'dotenv';
import escapeRegex from 'escape-string-regexp';
import type { SinonSpy } from 'cypress/types/sinon';

import { cyUserLogin, tenorUserLogin } from 'test/e2e/support/auth';

Cypress.Commands.add('startAppInstance', (appName, options) => {
  const {
    cyUser = 'default',
    tenorUser = null,
    evaluateBefore,
    urlSuffix = '',
    authenticationLevel = '1',
  } = options || {};
  const env = dotenv.config().parsed || {};
  cy.log(`Starting app instance: ${appName}`);

  // You can override the host we load css/js from, using multiple methods:
  //   1. Start Cypress with --env environment=<docker|podman|tt02>,host=<host>
  //   2. Set CYPRESS_HOST=<host> in your .env file
  // This is useful, for example if you want to run a Cypress test locally in the background while working on
  // other things. Build the app-frontend with `yarn build` and serve it with `yarn serve 8081`, then run
  // Cypress using a command like this:
  //   npx cypress run --env environment=tt02,host=localhost:8081 -s 'test/e2e/integration/*/*.ts'
  const targetHost = Cypress.env('host') || env.CYPRESS_HOST || 'localhost:8080';

  const visitOptions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onBeforeLoad: (win: any) => {
      const wrap =
        (name: string, spy: SinonSpy) =>
        (...args: unknown[]) => {
          Cypress.log({
            name,
            message: args.join(' '),
          });
          spy(...args);
        };

      // These have all been spied on by cypress-fail-on-console-error, so we wrap them and log to Cypress.log()
      // before the spy is called. This way, we can see the log message in the Cypress test runner output before
      // they potentially fail the test.
      win.console.log = wrap('console.log', win.console.log);
      win.console.warn = wrap('console.warn', win.console.warn);
      win.console.error = wrap('console.error', win.console.error);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onLoad: (win: any) => {
      if (win.logError) {
        cy.spy(win, 'logError').as('window.logError');
        cy.spy(win, 'logWarn').as('window.logWarn');
        cy.spy(win, 'logInfo').as('window.logInfo');

        cy.spy(win, 'logErrorOnce').as('window.logErrorOnce');
        cy.spy(win, 'logWarnOnce').as('window.logWarnOnce');
        cy.spy(win, 'logInfoOnce').as('window.logInfoOnce');
      }
    },
  };

  // Run this using --env environment=<docker|podman|tt02>,responseFuzzing=on to simulate an unreliable network. This might
  // help us find bugs (usually race conditions) that only occur requests/responses arrive out of order.
  if (Cypress.env('responseFuzzing') === 'on') {
    const [min, max] = [10, 1000];
    cy.log(`Response fuzzing on, will delay responses randomly between ${min}ms and ${max}ms`);
    cy.enableResponseFuzzing({ min, max, matchingRoutes: '**/api/**' });
    cy.enableResponseFuzzing({ min, max, matchingRoutes: '**/instances/**' });
  } else {
    cy.log(`Response fuzzing off, enable with --env responseFuzzing=on`);
  }

  const targetUrlRaw = getTargetUrl(appName) + urlSuffix;
  const targetUrl = new RegExp(`^${escapeRegex(targetUrlRaw)}/?$`);

  // Rewrite all references to the app-frontend with a local URL
  // We cannot just intercept and redirect (like we did before), because Percy reads this DOM to figure out where
  // to download assets from. If we redirect, Percy will download from altinncdn.no, which will cause the test to
  // use outdated CSS.
  // https://docs.percy.io/docs/debugging-sdks#asset-discovery
  cy.intercept({ url: targetUrl }, (req) => {
    const cookies = req.headers['cookie'] || '';
    req.on('response', (res) => {
      if (typeof res.body === 'string' || res.statusCode === 200) {
        if (evaluateBefore && !cookies.includes('cy-evaluated-js=true')) {
          res.body = generateHtmlToEval(evaluateBefore);
          return;
        }

        const source = /https?:\/\/.*?\/altinn-app-frontend\./g;
        const target = `http://${targetHost}/altinn-app-frontend.`;
        res.body = res.body.replace(source, target);
      }
    });
  }).as('app');

  cy.intercept('https://altinncdn.no/toolkits/altinn-app-frontend/*/altinn-app-frontend.*', (req) => {
    req.destroy();
    throw new Error('Requested asset from altinncdn.no, our rewrite code is apparently not working, aborting test');
  });

  cy.clearCookies();

  if (tenorUser) {
    tenorUserLogin({ appName, tenorUser, authenticationLevel });
  } else if (cyUser) {
    cyUserLogin({ cyUser, authenticationLevel });
    cy.visit(targetUrlRaw, visitOptions);
  } else {
    // No user provided
    cy.visit(targetUrlRaw, visitOptions);
  }

  if (evaluateBefore) {
    cy.get('#cy-evaluating-js').should('not.exist');
  }

  cy.injectAxe();
});

export function getTargetUrl(appName: string) {
  return Cypress.env('type') === 'localtest'
    ? `${Cypress.config('baseUrl')}/ttd/${appName}`
    : `https://ttd.apps.${Cypress.config('baseUrl')?.slice(8)}/ttd/${appName}`;
}

function generateHtmlToEval(javascript: string) {
  return `
    <html lang="en">
    <head>
      <title>Evaluating JavaScript before starting app</title>
      <script>
        async function toEvaluate() {
          ${javascript}
        }

        window.addEventListener('DOMContentLoaded', async () => {
          const maybeReturnUrl = await toEvaluate();
          document.cookie = 'cy-evaluated-js=true';
          if (maybeReturnUrl && typeof maybeReturnUrl === 'string') {
            window.location.href = maybeReturnUrl;
          } else {
            window.location.reload();
          }
        });
      </script>
    </head>
    <body>
      <div id="cy-evaluating-js"></div>
    </body>
  </html>
  `.trim();
}
