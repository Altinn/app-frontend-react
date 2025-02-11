import texts from 'test/e2e/fixtures/texts.json';
import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import { cyMockResponses } from 'test/e2e/pageobjects/party-mocks';

import { PartyType } from 'src/types/shared';
import type { IParty } from 'src/types/shared';

const appFrontend = new AppFrontend();

describe('Stateless party selection', () => {
  it('should show party selection before starting instance', () => {
    cyMockResponses({
      partyTypesAllowed: {
        person: true,
        subUnit: false,
        bankruptcyEstate: false,
        organisation: false,
      },
      allowedToInstantiate: (parties) => {
        // The user in tt02 has so many valid parties that we get pagination. Remove all except the first organisation
        // and all the persons.
        const toKeep: IParty[] = [];
        let foundOrganisation = false;
        for (const party of parties) {
          if (party.partyTypeName === PartyType.Organisation && !foundOrganisation) {
            toKeep.push(party);
            foundOrganisation = true;
          }
          if (party.partyTypeName === PartyType.Person) {
            toKeep.push(party);
          }
        }
        return toKeep;
      },
      doNotPromptForParty: false,
    });

    cy.startAppInstance(appFrontend.apps.stateless, { user: 'accountant' });
    cy.get(appFrontend.reporteeSelection.appHeader).should('be.visible');

    if (Cypress.env('type') === 'localtest') {
      cy.get(appFrontend.reporteeSelection.error).contains(texts.selectNewReportee);
      cy.findByText(
        /Du har startet tjenesten som .*?. Denne tjenesten er kun tilgjengelig for privatperson. Velg ny aktør under./,
      ).should('be.visible');
    } else {
      cy.findByText(/Jeg ønsker ikke å bli spurt om aktør hver gang/).should('be.visible');
    }

    cy.findAllByText(/personnr\. \d+/)
      .first()
      .click(); // Select the first person we find

    cy.get(appFrontend.stateless.name).should('exist').and('be.visible');
    cy.get(appFrontend.instantiationButton).click();
    cy.get('#sendInButton').should('exist');
  });
});
