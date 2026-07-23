import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import { Tenor } from 'test/e2e/support/users';

import { PartyType } from 'src/types/shared';
import type { IParty } from 'src/types/shared';

const appFrontend = new AppFrontend();

describe('Instance access for delegated signer', () => {
  it('allows access when the signer has no party allowed to instantiate', () => {
    let signerIsLoggingIn = false;

    // Regression setup for https://github.com/Altinn/altinn-studio/issues/19576:
    // PartyProvider used to require at least one party allowed to instantiate before rendering anything, including
    // an existing instance. Consequently, a user with delegated access to an existing instance saw
    // NoValidPartiesError (403) solely because they could not create a new instance. The test app normally lets
    // Standhaftig instantiate as themselves, so both the buggy and fixed frontend would pass this test. Returning
    // no allowed parties recreates the failing condition and ensures the test detects that unconditional check if
    // it is reintroduced. The delegated instance access itself remains real and is verified below.
    cy.intercept('GET', '**/api/v1/parties?allowedtoinstantiatefilter=true', (req) => {
      if (signerIsLoggingIn) {
        req.alias = 'signerAllowedParties';
      }
      req.continue((res) => {
        const partiesFromBackend = res.body as IParty[];
        const filteredParties = partiesFromBackend.filter((party) => party.partyTypeName === PartyType.Organisation);
        res.send(filteredParties);
      });
    });

    cy.startAppInstance(appFrontend.apps.signeringBrukerstyrt, {
      cyUser: null,
      tenorUser: Tenor.users.humanAndrefiolin,
      authenticationLevel: '2',
    });

    cy.findByRole('heading', { name: 'Hvem vil du sende inn for?' }).should('be.visible');
    cy.get('#party-700001').first().click();

    cy.findByRole('textbox', { name: /navn/i }).type('Testselskap AS');
    cy.findByRole('button', { name: /neste/i }).click();

    cy.findByRole('button', { name: /legg til person/i }).click();
    cy.findByRole('textbox', { name: /fødselsnummer/i }).type(Tenor.users.standhaftigBjornunge.ssn);
    cy.findByRole('textbox', { name: /navn/i }).type(Tenor.users.standhaftigBjornunge.name.split(' ')[1]);
    cy.findByRole('button', { name: /hent opplysninger/i }).click();
    cy.waitUntilSaved();
    cy.findByRole('textbox', { name: /navn/i }).should(
      'have.value',
      Tenor.users.standhaftigBjornunge.name.toUpperCase(),
    );
    cy.findByRole('textbox', { name: /adresse/i }).type('Testveien 2');
    cy.findByRole('textbox', { name: /postnr/i }).type('0244');
    cy.findByRole('textbox', { name: /poststed/i }).should('have.value', 'OSLO');
    cy.findByTestId('group-edit-container').within(() => {
      cy.findByRole('button', { name: /lagre og lukk/i }).click();
    });

    cy.findByRole('button', { name: /neste/i }).click();
    cy.findByRole('textbox', { name: /aksjekapital/i }).type('1000000');
    cy.findByRole('textbox', { name: /aksjens pålydende/i }).type('10000');
    cy.findByRole('textbox', { name: /frist for innbetaling av aksjeinnskuddet/i }).type('31.12.2030');
    cy.findByRole('button', { name: /neste/i }).click();

    cy.findByRole('textbox', { name: /fødselsnummer/i }).type(Tenor.users.varsomDiameter.ssn);
    cy.findByRole('textbox', { name: /etternavn/i }).type(Tenor.users.varsomDiameter.name.split(' ')[1]);
    cy.findByRole('button', { name: /hent opplysninger/i }).click();
    cy.findByRole('radio', {
      name: /årsregnskapene skal ikke revideres og selskapet skal ikke ha revisor/i,
    }).click();
    cy.findByRole('button', { name: /neste/i }).click();

    cy.findByRole('button', { name: /til signering/i }).click();
    cy.findByRole('heading', { name: /personer som skal signere/i }).should('be.visible');

    cy.url().then((instanceUrl) => {
      const instanceHash = new URL(instanceUrl).hash;
      const instanceId = instanceHash.match(/\d+\/[\da-f-]{36}/i)?.[0];
      expect(instanceId, 'instance ID').to.exist;

      // Standhaftig has been delegated access to this existing instance, despite having no party that can
      // instantiate the app after the response above is filtered.
      cy.intercept('GET', `**/instances/${instanceId}`).as('delegatedInstance');
      signerIsLoggingIn = true;
      cy.startAppInstance(appFrontend.apps.signeringBrukerstyrt, {
        cyUser: null,
        tenorUser: Tenor.users.standhaftigBjornunge,
        authenticationLevel: '2',
        urlSuffix: instanceHash,
      });

      // Access to an existing instance must depend on the instance request, not whether the user can instantiate
      // the app. The latter is only relevant when entering the app without an instance.
      cy.wait('@signerAllowedParties').its('response.body').should('deep.equal', []);
      cy.wait('@delegatedInstance').its('response.statusCode').should('eq', 200);
      cy.get(appFrontend.instanceErrorCode).should('not.exist');
      cy.findByRole('heading', { name: /personer som skal signere/i }).should('be.visible');
    });
  });
});
