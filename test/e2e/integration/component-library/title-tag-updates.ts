import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('Title tag updates', () => {
  it('Should update the title tag when changing pages', () => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.get('#navigation-menu').find('button').contains('16. Oppsummering 2.0').click();

    cy.get('#navigation-menu').find('button').contains('15. Tabs').click();

    cy.title().should('eq', 'Tabs - altinn-apps-all-components - Testdepartementet');

    cy.visit('/ttd/component-library/#/instance-selection');

    cy.title().should('eq', 'Fortsett der du slapp - altinn-apps-all-components - Testdepartementet');

    cy.visit('/ttd/component-library/#/party-selection/');

    cy.title().should('eq', 'Hvem vil du sende inn for? - altinn-apps-all-components - Testdepartementet');
  });

  it('Should update the title in error page', () => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.get('#navigation-menu').find('button').contains('16. Oppsummering 2.0').click();
    cy.url().then((currentUrl) => {
      cy.log(currentUrl);
      const newUrl = currentUrl.replace('Task_1', 'Task_3');
      cy.visit(newUrl);
      cy.title().should('eq', 'Denne delen av skjemaet finnes ikke. - altinn-apps-all-components - Testdepartementet');
    });
  });
});
