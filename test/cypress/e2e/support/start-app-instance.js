/// <reference types='cypress' />
import AppFrontend from '../pageobjects/app-frontend';

const appFrontend = new AppFrontend();

Cypress.Commands.add('startAppInstance', (appName, anonymous=false) => {
  const visitOptions = {
    onBeforeLoad: (win) => {
      cy.spy(win.console, 'log').as('console.log');
      cy.spy(win.console, 'warn').as('console.warn');
      cy.spy(win.console, 'error').as('console.error');
    },
  };

  if (Cypress.env('responseFuzzing') === 'on') {
    const [min, max] = [10, 1000];
    cy.log(`Response fuzzing on, will delay responses randomly between ${min}ms and ${max}ms`);

    const rand = () => {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

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

  cy.visit('/', visitOptions);

  const appPath = `/ttd/${appName}/`;
  const appUrl = Cypress.env('environment') === 'local'
    ? `${Cypress.config('baseUrl')}${appPath}`
    : `https://ttd.apps.${Cypress.config('baseUrl').slice(8)}`;

  // Rewrite all references to the app-frontend with a local URL
  cy.intercept({ path: appPath }, (req) => {
    req.on('response', (res) => {
      if (typeof res.body !== 'string') {
        res.send();
        return;
      }

      const source = /https?:\/\/.*?\/altinn-app-frontend\./g;
      const target = `${Cypress.config(`frontendUrl`)}/altinn-app-frontend.`;
      const body = res.body.replace(source, target);
      res.send({ body });
    });
  }).as('appIndex');

  if (Cypress.env('environment') === 'local') {
    if (anonymous) {
      cy.visit(appUrl, visitOptions);
    } else {
      cy.get(appFrontend.appSelection).select(appName);
      cy.get(appFrontend.startButton).click();
    }
  } else {
    if (!anonymous) {
      authenticateAltinnII(Cypress.env('testUserName'), Cypress.env('testUserPwd'));
    }
    cy.visit(appUrl, visitOptions);
  }
});

function authenticateAltinnII(userName, userPwd) {
  cy.request({
    method: 'POST',
    url: `${Cypress.config('baseUrl')}/api/authentication/authenticatewithpassword`,
    headers: {
      'Content-Type': 'application/hal+json',
    },
    body: JSON.stringify({
      UserName: userName,
      UserPassword: userPwd,
    }),
  });
}
