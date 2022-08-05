import './localtest';
import './app';
import './app-frontend';
import './custom';
import 'cypress-plugin-tab';
import './start-app-instance';
import './wcag';
import 'cypress-axe';
import chaiExtensions from './chai-extensions';

before(() => {
  chai.use(chaiExtensions);
});

const failedCaseTable = {};
afterEach(function () {
  if (this.currentTest.state === 'failed') {
    cy.window().then((win) => {
      const testName = this.currentTest.fullTitle();

      // Remember the test case retry times
      if (failedCaseTable[testName]) {
        failedCaseTable[testName] += 1;
      } else {
        failedCaseTable[testName] = 1;
      }

      if (!win.getRecordedStateHistory) {
        console.error('Failed to get redux history: function not accessible');
        return;
      }

      const title = this.currentTest.title.replace(/\s+/, '-').replace(/[^a-zA-Z\-0-9_]/, '');
      const specBaseName = Cypress.spec.relative.split(/[\\\/]/).pop().split('.')[0];
      const attempt = `failed${failedCaseTable[testName]}`;
      const fileName = `redux-${specBaseName}-${title}-${attempt}.json`;

      const history = win.getRecordedStateHistory();
      cy.writeFile('redux-history/' + fileName, JSON.stringify(history, null, 2));
    });
  }
});
