import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

import type { ILayoutSets } from 'src/types';

const appFrontend = new AppFrontend();

describe('Auto save behavior', () => {
  it('On change form data: Check if PUT data is called 1 time after clicking checkbox', () => {
    let putFormDataCounter = 0;
    cy.interceptLayoutSetsUiSettings({ autoSaveBehavior: 'onChangeFormData' });
    cy.goto('group').then(() => {
      cy.intercept('PUT', '**/data/**', () => {
        putFormDataCounter++;
      }).as('putFormData');
      cy.get(appFrontend.group.prefill.liten).dsCheck();
      cy.wait('@putFormData').then(() => {
        expect(putFormDataCounter).to.be.eq(1);
      });
      cy.get(appFrontend.nextButton).clickAndGone();
      cy.get(appFrontend.backButton).clickAndGone();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000).then(() => {
        // Wait 1 second to be sure it is not called
        expect(putFormDataCounter).to.be.eq(1);
      });
    });
  });
  it('On change page: Check if PUT data is called when clicking different navigation buttons', () => {
    let putFormDataCounter = 0;
    cy.interceptLayoutSetsUiSettings({ autoSaveBehavior: 'onChangePage' });
    cy.goto('group').then(() => {
      cy.intercept('PUT', '**/data/**', () => {
        putFormDataCounter++;
      }).as('putFormData');
      cy.get(appFrontend.group.prefill.liten).dsCheck();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000).then(() => {
        // Wait 1 second to be sure it is not called
        expect(putFormDataCounter).to.be.eq(0);
      });
      cy.get(appFrontend.nextButton).clickAndGone();
      cy.wait('@putFormData').then(() => {
        expect(putFormDataCounter).to.be.eq(1);
      });
      cy.get(appFrontend.backButton).clickAndGone();
      cy.wait('@putFormData').then(() => {
        expect(putFormDataCounter).to.be.eq(2);
      });
      cy.get(appFrontend.navMenu).findByRole('button', { name: '2. repeating' }).click();
      cy.wait('@putFormData').then(() => {
        expect(putFormDataCounter).to.be.eq(3);
      });
      cy.get(appFrontend.prevButton).clickAndGone();
      cy.wait('@putFormData').then(() => {
        expect(putFormDataCounter).to.be.eq(4);
      });
    });
  });
});

function interceptLayoutSetsUiSettings(uiSettings: Partial<ILayoutSets['uiSettings']>) {
  cy.intercept('GET', '**/api/layoutsets', (req) => {
    req.continue((res) => {
      const body = JSON.parse(res.body);
      res.body = JSON.stringify({
        ...body,
        uiSettings: { ...body.uiSettings, ...uiSettings },
      });
    });
  }).as('layoutSets');
}
