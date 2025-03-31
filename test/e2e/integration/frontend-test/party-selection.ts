import texts from 'test/e2e/fixtures/texts.json';
import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import { cyMockResponses, CyPartyMocks, removeAllButOneOrg } from 'test/e2e/pageobjects/party-mocks';

import type { IParty } from 'src/types/shared';

const appFrontend = new AppFrontend();

describe('Party selection', () => {
  it('Party selection filtering and search', () => {
    cyMockResponses({
      parties: [CyPartyMocks.ExampleOrgWithSubUnit, CyPartyMocks.ExampleDeletedOrg],
      allowedToInstantiate: [CyPartyMocks.ExampleOrgWithSubUnit, CyPartyMocks.ExampleDeletedOrg],
      doNotPromptForParty: false,
    });
    cy.startAppInstance(appFrontend.apps.frontendTest);

    cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');
    cy.get(appFrontend.reporteeSelection.error).contains(texts.selectNewReportee);
    cy.findByText('underenheter').click();
    cy.contains(appFrontend.reporteeSelection.subUnits, 'Bergen').should('be.visible');
    cy.contains(appFrontend.reporteeSelection.reportee, 'slettet').should('not.exist');
    cy.findByRole('checkbox', { name: /Vis slettede/i }).dsCheck();
    cy.contains(appFrontend.reporteeSelection.reportee, 'slettet').should('be.visible');
    cy.findByRole('checkbox', { name: /Vis underenheter/i }).dsCheck();
    cy.findByText('underenheter').click();
    cy.get(appFrontend.reporteeSelection.searchReportee).type('DDG');
    cy.get(appFrontend.reporteeSelection.reportee).should('have.length', 1).contains('DDG');
  });

  it('Should show the correct title', () => {
    cyMockResponses({
      doNotPromptForParty: false,
    });
    cy.startAppInstance(appFrontend.apps.frontendTest);

    cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');
    cy.title().should('eq', 'Hvem vil du sende inn for? - frontend-test - Testdepartementet');
  });

  it('Should skip party selection if you can only represent one person', () => {
    cyMockResponses({
      allowedToInstantiate: [CyPartyMocks.ExamplePerson1],
      userParty: CyPartyMocks.ExamplePerson1,
    });
    cy.intercept(
      'POST',
      `/ttd/frontend-test/instances?instanceOwnerPartyId=${CyPartyMocks.ExamplePerson1.partyId}*`,
    ).as('createInstance');
    cy.startAppInstance(appFrontend.apps.frontendTest);

    cy.get(appFrontend.reporteeSelection.reportee).should('not.exist');
    cy.wait('@createInstance');

    // This fails in the end because the partyId does not exist, but we still proved
    // that party selection did not appear (even though @loadInstance fails with a 404)
    cy.allowFailureOnEnd();
  });

  it('Should show party selection with a warning when you cannot use the preselected party', () => {
    cyMockResponses({
      // We'll only allow one party to be selected, and it's not the preselected one. Even though one-party-choices
      // normally won't show up as being selectable, we'll still show the warning in these cases.
      parties: [CyPartyMocks.ExampleOrgWithSubUnit, CyPartyMocks.ExamplePerson2],
      allowedToInstantiate: [CyPartyMocks.ExamplePerson2],
    });

    cy.startAppInstance(appFrontend.apps.frontendTest);

    cy.setCookie('AltinnPartyId', CyPartyMocks.ExampleOrgWithSubUnit.partyId.toString());

    cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');
    cy.get(appFrontend.reporteeSelection.error).should('be.visible');
    cy.findByText(new RegExp(CyPartyMocks.ExampleOrgWithSubUnit.name, 'i')).should('be.visible');
  });

  it('Should show an error if there are no parties to select from', () => {
    cyMockResponses({
      allowedToInstantiate: [],
    });
    cy.startAppInstance(appFrontend.apps.frontendTest);
    cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');
    cy.get('[data-testid=StatusCode]').should('exist');
    cy.allowFailureOnEnd();
  });

  it('List of parties should show correct icon and org nr or ssn', () => {
    cyMockResponses({
      allowedToInstantiate: (parties) => [
        ...parties,
        CyPartyMocks.ExamplePerson1,
        CyPartyMocks.InvalidParty,
        CyPartyMocks.ExampleOrgWithSubUnit,
      ],
      doNotPromptForParty: false,
    });
    cy.startAppInstance(appFrontend.apps.frontendTest);
    cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');
    cy.get('[id^="party-"]').each((element) => {
      // Check for SVG elements with specific test IDs
      const orgIcon = element.find('svg[data-testid="org-icon"]');
      const personIcon = element.find('svg[data-testid="person-icon"]');

      if (orgIcon.length > 0) {
        // Validate sibling for org-icon
        const siblingP = orgIcon.next().next();
        cy.wrap(siblingP).should('exist').and('have.prop', 'tagName', 'P').and('contain.text', 'org.nr.');
      }

      if (personIcon.length > 0) {
        // Validate sibling for person-icon
        const siblingP = personIcon.next().next();
        cy.wrap(siblingP).should('exist').and('have.prop', 'tagName', 'P').and('contain.text', 'personnr');
      }
    });
  });

  [false].forEach((doNotPromptForParty) => {
    it(`${
      doNotPromptForParty ? 'Does not prompt' : 'Prompts'
    } for party when doNotPromptForParty = ${doNotPromptForParty}, on instantiation with multiple possible parties`, () => {
      cyMockResponses({
        allowedToInstantiate: (parties) => [...parties, CyPartyMocks.ExamplePerson1],
        doNotPromptForParty,
      });
      cy.startAppInstance(appFrontend.apps.frontendTest);

      if (!doNotPromptForParty) {
        cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');
        cy.get('[id^="party-"]').should('be.visible');
        cy.findByRole('heading', { name: 'Hvorfor ser jeg dette?' }).should('be.visible');
        cy.findByRole('heading', { name: 'Hvorfor ser jeg dette?' })
          .siblings('p')
          .first()
          .should(
            'contain.text',
            'Du kan endre profilinnstillingene dine for å ikke bli spurt om aktør hver gang du starter utfylling av et nytt skjema.',
          );
        cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('not.exist');

        cy.snapshot('reportee-selection');

        cy.get('[id^="party-"]').eq(0).click();
      }

      cy.get(appFrontend.appHeader).should('be.visible');
      cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('be.visible');
      cy.get('[id^="party-"]').should('not.exist');

      // Test that it goes straight in when accessing an existing instance
      cy.reloadAndWait();

      cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('be.visible');
      cy.get('[id^="party-"]').should('not.exist');
    });
  });

  [true, false].forEach((doNotPromptForParty) => {
    it(`Does not prompt for party when doNotPromptForParty = ${doNotPromptForParty}, on instantiation with only one possible party`, () => {
      cyMockResponses({
        doNotPromptForParty,
      });

      let userParty: IParty | undefined;

      // Intercept /profile/user to capture the user party
      cy.intercept('GET', '**/api/v1/profile/user', (req) => {
        req.continue((res) => {
          userParty = res.body.party;
          res.send(res.body);
        });
      }).as('getUserProfile');

      // Intercept /parties?allowedtoinstantiatefilter=true and filter by user party
      cy.intercept('GET', '**/api/v1/parties?allowedtoinstantiatefilter=true', (req) => {
        req.continue((res) => {
          const filteredParties = res.body.filter((party: IParty) => party.partyId === userParty?.partyId);
          res.send(filteredParties);
        });
      }).as('getAllowedToInstantiateParties');

      // Intercept /parties and filter by user party
      cy.intercept('GET', '**/api/v1/parties', (req) => {
        req.continue((res) => {
          const filteredParties = res.body.filter((party: IParty) => party.partyId === userParty?.partyId);
          res.send(filteredParties);
        });
      }).as('getAllParties');

      // Start the app instance
      cy.startAppInstance(appFrontend.apps.frontendTest, { user: 'default' });

      // Wait for the intercepts to complete
      cy.wait('@getUserProfile');
      cy.wait('@getAllowedToInstantiateParties');
      cy.wait('@getAllParties');

      // Assert that the app does not prompt for party selection
      cy.get(appFrontend.appHeader).should('be.visible');
      cy.get('[id^="party-"]').should('not.exist');
      cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('be.visible');

      cy.startAppInstance(appFrontend.apps.frontendTest, { user: 'default' });
      cy.get(appFrontend.appHeader).should('be.visible');
      cy.get('[id^="party-"]').should('not.exist');

      cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('be.visible');
    });
  });

  [
    { doNotPromptForPartyPreference: true, appPromptForPartyOverride: 'always' as const },
    { doNotPromptForPartyPreference: false, appPromptForPartyOverride: 'never' as const },
  ].forEach(({ doNotPromptForPartyPreference, appPromptForPartyOverride }) => {
    it(`Correctly overrides the profile doNotPromptForPartyPreference when doNotPromptForPartyPreference=${doNotPromptForPartyPreference} and appPromptForPartyOverride=${appPromptForPartyOverride}`, () => {
      cyMockResponses({
        doNotPromptForParty: doNotPromptForPartyPreference,
        appPromptForPartyOverride,
        allowedToInstantiate: (parties) => [...parties, CyPartyMocks.ExamplePerson1],
      });
      cy.startAppInstance(appFrontend.apps.frontendTest, { user: 'default' });

      if (appPromptForPartyOverride === 'always') {
        cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');
        cy.get('[id^="party-"]').should('be.visible');
        cy.findByRole('heading', { name: 'Hvorfor ser jeg dette?' }).should('be.visible');
        cy.findByRole('heading', { name: 'Hvorfor ser jeg dette?' })
          .siblings('p')
          .first()
          .should('contain.text', 'Denne appen er satt opp til å alltid spørre om aktør.');
        cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('not.exist');

        cy.get('[id^="party-"]').eq(0).click();
      }

      cy.get(appFrontend.appHeader).should('be.visible');
      cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('be.visible');
      cy.get('[id^="party-"]').should('not.exist');
      cy.findByRole('heading', { name: 'Hvorfor ser jeg dette?' }).should('not.exist');
    });
  });

  it('Should be possible to select another party if instantiation fails, and go back to party selection and instantiate again', () => {
    cy.allowFailureOnEnd();
    cyMockResponses({
      allowedToInstantiate: removeAllButOneOrg,
      parties: removeAllButOneOrg,
      doNotPromptForParty: false,
    });

    // Intercept subsequent requests and let them go through normally
    cy.intercept({ method: 'POST', url: `**/instances?instanceOwnerPartyId*` }, (req) => {
      req.continue();
    }).as('createInstance');

    // Intercept the first request and return a 403 error (must be defined after the other intercept)
    cy.intercept({ method: 'POST', url: `**/instances?instanceOwnerPartyId*`, times: 1 }, { statusCode: 403 }).as(
      'createInstanceError',
    );

    // Start the app instance
    cy.startAppInstance(appFrontend.apps.frontendTest, { user: 'accountant' });

    // Select the first organization. This is not allowed to instantiate in this app, so it will throw an error.
    cy.findAllByText(/org\.nr\. \d+/)
      .first()
      .click();

    // Wait for the first request to complete and verify the error
    cy.wait('@createInstanceError');
    cy.get(appFrontend.altinnError).should('contain.text', texts.missingRights);

    // Try again with another party
    cy.findByRole('link', { name: 'skift aktør her' }).click();
    cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');

    cy.get(appFrontend.reporteeSelection.searchReportee).should('exist');

    // The person on the other hand is allowed to instantiate
    cy.findAllByText(/personnr\. \d+/)
      .first()
      .click();

    cy.wait('@createInstance');
    cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('be.visible');

    // To make sure this instance is different from the next, we navigate to the next process step in this one
    cy.findByRole('button', { name: 'Send inn' }).click();
    cy.get(appFrontend.changeOfName.newFirstName).should('be.visible');

    // Navigate directly to /#/party-selection to test that instantiation once more works
    cy.window().then((win) => {
      win.location.hash = '#/party-selection';
    });
    cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');

    // Select the second party again
    cy.findAllByText(/personnr\. \d+/)
      .first()
      .click();

    cy.wait('@createInstance');
    cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('be.visible');
  });
});
