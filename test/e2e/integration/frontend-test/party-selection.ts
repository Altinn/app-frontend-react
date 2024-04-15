import texts from 'test/e2e/fixtures/texts.json';
import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

import { PartyType } from 'src/types/shared';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IParty } from 'src/types/shared';

const appFrontend = new AppFrontend();

const ExampleOrgWithSubUnit: IParty = {
  partyId: 500000,
  partyTypeName: PartyType.Organisation,
  orgNumber: '897069650',
  ssn: null,
  unitType: 'AS',
  name: 'DDG Fitness AS',
  isDeleted: false,
  onlyHierarchyElementWithNoAccess: false,
  person: null,
  organization: null,
  childParties: [
    {
      partyId: 500001,
      partyTypeName: PartyType.Organisation,
      orgNumber: '897069651',
      ssn: null,
      unitType: 'BEDR',
      name: 'DDG Fitness Bergen',
      isDeleted: false,
      onlyHierarchyElementWithNoAccess: false,
      person: null,
      organization: null,
      childParties: null,
    },
  ],
};

const ExampleDeletedOrg: IParty = {
  partyId: 500600,
  partyTypeName: PartyType.Organisation,
  orgNumber: '897069631',
  ssn: null,
  unitType: 'AS',
  name: 'EAS Health Consulting',
  isDeleted: true,
  onlyHierarchyElementWithNoAccess: false,
  person: null,
  organization: null,
  childParties: [],
};

const ExamplePerson1: IParty = {
  partyId: 12345678,
  partyTypeName: PartyType.Person,
  ssn: '12312312345',
  unitType: null,
  name: 'Fake Party',
  isDeleted: false,
  onlyHierarchyElementWithNoAccess: false,
  person: null,
  organization: null,
  childParties: null,
};

const Sophie: IParty = {
  partyId: 501337,
  partyUuid: null,
  partyTypeName: 1,
  orgNumber: null,
  ssn: '01039012345',
  unitType: null,
  name: 'Sophie Salt',
  isDeleted: false,
  onlyHierarchyElementWithNoAccess: false,
  organization: null,
  childParties: null,
};

const ExamplePerson2: IParty = {
  partyId: 12345679,
  partyTypeName: PartyType.Person,
  ssn: '12312312344',
  unitType: null,
  name: 'Fake Person2',
  isDeleted: false,
  onlyHierarchyElementWithNoAccess: false,
  person: null,
  organization: null,
  childParties: null,
};

interface Mockable {
  preSelectedParty?: number;
  currentParty?: IParty;
  allowedToInstantiate?: IParty[] | ((parties: IParty[]) => IParty[]);
  doNotPromptForParty?: boolean;
  appPromptForPartyOverride?: IApplicationMetadata['promptForParty'];
  partyTypesAllowed?: IApplicationMetadata['partyTypesAllowed'];
  // validParties?: IParty[];
}

function mockResponses(whatToMock: Mockable) {
  if (whatToMock.preSelectedParty !== undefined) {
    // Sets the 'AltinnPartyId' cookie to emulate having selected a party when logging in to Altinn
    cy.setCookie('AltinnPartyId', whatToMock.preSelectedParty.toString());
  }

  if (whatToMock.currentParty) {
    cy.intercept('GET', `**/api/authorization/parties/current?returnPartyObject=true`, (req) => {
      req.on('response', (res) => {
        res.body = whatToMock.currentParty;
      });
    });
  }

  if (whatToMock.allowedToInstantiate) {
    cy.intercept('GET', `**/api/v1/parties?allowedtoinstantiatefilter=true`, (req) => {
      req.continue((res) => {
        const body =
          whatToMock.allowedToInstantiate instanceof Function
            ? (whatToMock.allowedToInstantiate(res.body) as any)
            : (whatToMock.allowedToInstantiate as any);
        res.send(body);
      });
    });
  }
  if (whatToMock.doNotPromptForParty !== undefined) {
    cy.intercept('GET', '**/api/v1/profile/user', {
      body: {
        profileSettingPreference: {
          doNotPromptForParty: whatToMock.doNotPromptForParty,
        },
      },
    });
  }
  if (whatToMock.appPromptForPartyOverride !== undefined || whatToMock.partyTypesAllowed !== undefined) {
    cy.intercept('GET', '**/api/v1/applicationmetadata', (req) => {
      req.on('response', (res) => {
        if (whatToMock.appPromptForPartyOverride !== undefined) {
          res.body.promptForParty = whatToMock.appPromptForPartyOverride;
        }
        if (whatToMock.partyTypesAllowed !== undefined) {
          res.body.partyTypesAllowed = whatToMock.partyTypesAllowed;
        }
      });
    });
  }

  cy.intercept('**/active', []).as('noActiveInstances');
}

describe('Party selection', () => {
  it('Party selection filtering and search', () => {
    mockResponses({ allowedToInstantiate: [ExampleOrgWithSubUnit, ExampleDeletedOrg] });
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

  it('Org number should not be displayed for persons', () => {
    mockResponses({
      allowedToInstantiate: [ExamplePerson1, ExamplePerson2],
      partyTypesAllowed: {
        person: true,
        subUnit: false,
        bankruptcyEstate: false,
        organisation: false,
      },
    });

    cy.startAppInstance(appFrontend.apps.frontendTest);

    // TODO: Implement the rest
  });

  it('Should skip party selection if you can only represent one person', () => {
    mockResponses({
      preSelectedParty: ExamplePerson1.partyId,
      currentParty: ExamplePerson1,
      allowedToInstantiate: [ExamplePerson1],
    });
    cy.intercept('POST', `/ttd/frontend-test/instances?instanceOwnerPartyId=12345678`).as('loadInstance');
    cy.startAppInstance(appFrontend.apps.frontendTest);
    cy.get(appFrontend.reporteeSelection.reportee).should('not.exist');
    cy.wait('@loadInstance');
  });

  it('Should show party selection with a warning when you cannot use the preselected party', () => {
    mockResponses({
      preSelectedParty: ExampleOrgWithSubUnit.partyId,

      // We'll only allow one party to be selected, and it's not the preselected one. Even though one-party-choices
      // normally won't show up as being selectable, we'll still show the warning in these cases.
      allowedToInstantiate: [ExamplePerson2],
      partyTypesAllowed: {
        person: true,
        subUnit: false,
        bankruptcyEstate: false,
        organisation: false,
      },
    });

    cy.startAppInstance(appFrontend.apps.frontendTest);
    cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');
    cy.get(appFrontend.reporteeSelection.error).should('be.visible');
  });

  it('Should show an error if there are no parties to select from', () => {
    mockResponses({
      allowedToInstantiate: [],
      partyTypesAllowed: {
        person: false,
        subUnit: false,
        bankruptcyEstate: false,
        organisation: true,
      },
    });
    cy.startAppInstance(appFrontend.apps.frontendTest);
    cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');
    cy.get('[data-testid=StatusCode').should('exist');
  });

  // it.only('Should prompt fo', () => {
  //   mockResponses({
  //     allowedToInstantiate: [],
  //     partyTypesAllowed: {
  //       person: false,
  //       subUnit: false,
  //       bankruptcyEstate: false,
  //       organisation: true,
  //     },
  //   });
  //   cy.startAppInstance(appFrontend.apps.frontendTest);
  //   cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');
  //   cy.get('[data-testid=StatusCode').should('exist');
  // });

  // it('Selecting a party should instantiate using that party', () => {
  //   // TODO: Implement the rest
  // });

  // it('Auto-selecting a party when only one is available should instantiate using that party', () => {
  //   mockResponses({
  //     allowedToInstantiate: [ExamplePerson1],
  //     partyTypesAllowed: {
  //       person: true,
  //       subUnit: false,
  //       bankruptcyEstate: false,
  //       organisation: false,
  //     },
  //   });
  //
  //   // TODO: Implement the rest
  // });

  [true, false].forEach((doNotPromptForParty) => {
    it(`${
      doNotPromptForParty ? 'Does not prompt' : 'Prompts'
    } for party when doNotPromptForParty = ${doNotPromptForParty}, on instantiation with multiple possible parties`, () => {
      mockResponses({
        allowedToInstantiate: (parties) => [...parties, ExamplePerson1],
        doNotPromptForParty,
      });
      cy.startAppInstance(appFrontend.apps.frontendTest);
      cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');

      if (!doNotPromptForParty) {
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
      mockResponses({
        allowedToInstantiate: (parties) => [parties[0]],
        doNotPromptForParty,
      });

      cy.startAppInstance(appFrontend.apps.frontendTest);
      cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');
      cy.get('[id^="party-"]').should('not.exist');

      cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('be.visible');
    });
  });

  // Correctly overrides the profile doNotPromptForPartyPreference when doNotPromptForPartyPreference=true and appPromptForPartyOverride=always

  [
    { doNotPromptForPartyPreference: true, appPromptForPartyOverride: 'always' as const },
    //{ doNotPromptForPartyPreference: false, appPromptForPartyOverride: 'never' as const },
  ].forEach(({ doNotPromptForPartyPreference, appPromptForPartyOverride }) => {
    it.only(`Correctly overrides the profile doNotPromptForPartyPreference when doNotPromptForPartyPreference=${doNotPromptForPartyPreference} and appPromptForPartyOverride=${appPromptForPartyOverride}`, () => {
      mockResponses({
        doNotPromptForParty: doNotPromptForPartyPreference,
        appPromptForPartyOverride,
        allowedToInstantiate: [Sophie, ExamplePerson2],
        currentParty: Sophie,
      });
      cy.startAppInstance(appFrontend.apps.frontendTest);
      cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');

      if (appPromptForPartyOverride === 'always') {
        cy.get('[id^="party-"]').should('be.visible');
        cy.findByRole('heading', { name: 'Hvorfor ser jeg dette?' }).should('be.visible');
        cy.findByRole('heading', { name: 'Hvorfor ser jeg dette?' })
          .siblings('p')
          .first()
          .should('contain.text', 'Denne appen er satt opp til å alltid spørre om aktør.');
        cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('not.exist');

        cy.get('[id^="party-"]').eq(0).click();
      }

      cy.findByRole('heading', { name: 'Appen for test av app frontend' }).should('be.visible');
      cy.get('[id^="party-"]').should('not.exist');
      cy.findByRole('heading', { name: 'Hvorfor ser jeg dette?' }).should('not.exist');
    });
  });
});
