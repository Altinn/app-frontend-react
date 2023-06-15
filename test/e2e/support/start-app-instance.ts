import dotenv from 'dotenv';

import { login } from 'test/e2e/support/auth';
import type { user } from 'test/e2e/support/auth';

Cypress.Commands.add('startAppInstance', (appName, user: user | null = 'default') => {
  const anonymous = user === null;
  const env = dotenv.config().parsed || {};

  // You can override the host we load css/js from, using multiple methods:
  //   1. Start Cypress with --env environment=<local|tt02>,host=<host>
  //   2. Set CYPRESS_HOST=<host> in your .env file
  // This is useful, for example if you want to run a Cypress test locally in the background while working on
  // other things. Build the app-frontend with `yarn build` and serve it with `yarn serve 8081`, then run
  // Cypress using a command like this:
  //   npx cypress run --env environment=tt02,host=localhost:8081 -s 'test/e2e/integration/*/*.ts'
  const targetHost = Cypress.env('host') || env.CYPRESS_HOST || 'localhost:8080';

  const visitOptions = {
    onBeforeLoad: (win) => {
      cy.spy(win.console, 'log').as('console.log');
      cy.spy(win.console, 'warn').as('console.warn');
      cy.spy(win.console, 'error').as('console.error');
    },
  };

  // Run this using --env environment=<local|tt02>,responseFuzzing=on to simulate an unreliable network. This might
  // help us find bugs (usually race conditions) that only occur requests/responses arrive out of order.
  if (Cypress.env('responseFuzzing') === 'on') {
    const [min, max] = [10, 1000];
    cy.log(`Response fuzzing on, will delay responses randomly between ${min}ms and ${max}ms`);

    const rand = () => Math.floor(Math.random() * (max - min + 1) + min);

    const randomDelays = (req) => {
      req.on('response', (res) => {
        res.setDelay(rand());
      });
    };
    cy.intercept('**/api/**', randomDelays);
    cy.intercept('**/instances/**', randomDelays);
  } else {
    cy.log(`Response fuzzing off, enable with --env responseFuzzing=on`);
  }

  const targetUrl =
    Cypress.env('environment') === 'local'
      ? `${Cypress.config('baseUrl')}/ttd/${appName}`
      : `https://ttd.apps.${Cypress.config('baseUrl')?.slice(8)}/ttd/${appName}`;

  // Rewrite all references to the app-frontend with a local URL
  // We cannot just intercept and redirect (like we did before), because Percy reads this DOM to figure out where
  // to download assets from. If we redirect, Percy will download from altinncdn.no, which will cause the test to
  // use outdated CSS.
  // https://docs.percy.io/docs/debugging-sdks#asset-discovery
  cy.intercept(targetUrl, (req) => {
    req.on('response', (res) => {
      if (typeof res.body === 'string' || res.statusCode === 200) {
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

  if (!anonymous) {
    login(user);
  }

  cy.visit(targetUrl, visitOptions);
});
