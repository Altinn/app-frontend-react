import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import { getTargetUrl, tenorUserLogin } from 'test/e2e/support/start-app-instance';
import { reverseName } from 'test/e2e/support/utils';
import type { TenorOrg, TenorUser } from 'test/e2e/support/auth';

const appFrontend = new AppFrontend();

type CyTenorOrg = 'Sivilisert Avansert Isbjørn SA' | 'Tilbakeholden Upopulær Tiger AS' | 'Offisiell Virtuell Tiger AS';

const tenorOrgs: { [K in CyTenorOrg]: TenorOrg } = {
  'Sivilisert Avansert Isbjørn SA': {
    name: 'Sivilisert Avansert Isbjørn SA',
    orgNr: '312405091',
  },
  'Tilbakeholden Upopulær Tiger AS': {
    name: 'Tilbakeholden Upopulær Tiger AS',
    orgNr: '314307577',
  },
  'Offisiell Virtuell Tiger AS': {
    name: 'Offisiell Virtuell Tiger AS',
    orgNr: '314277961',
  },
};

const tenorUsers: Record<string, TenorUser> = {
  humanAndrefiolin: {
    name: 'Human Andrefiolin',
    ssn: '09876298713',
    role: 'CEO',
    orgs: ['Sivilisert Avansert Isbjørn SA'],
  },
  varsomDiameter: {
    name: 'Varsom Diameter',
    ssn: '03835698199',
    role: 'Chairman',
    orgs: ['Sivilisert Avansert Isbjørn SA'],
  },
  standhaftigBjornunge: {
    name: 'Standhaftig Bjørnunge',
    ssn: '23849199013',
  },
  snaalDugnad: {
    name: 'Snål Dugnad',
    ssn: '10928198958',
    orgs: ['Tilbakeholden Upopulær Tiger AS', 'Offisiell Virtuell Tiger AS'],
  },
};

describe('Signing', () => {
  it('should allow signing by a specified signee and on behalf of a company', () => {
    // Step 1: Log in as the initial user
    cy.startAppInstance(appFrontend.apps.signeringBrukerstyrt, {
      tenorUser: tenorUsers.humanAndrefiolin,
      authenticationLevel: '2',
    });

    let prevHash: string;
    cy.log(window.location.toString());

    // Step 2: Fill in the form and specify other valid users as signees

    // Om selskapet
    cy.url().then(() => {
      cy.findByRole('textbox', { name: /navn/i }).type('Testselskap AS');
      cy.findByRole('button', { name: /neste/i }).click();

      // Stiftere og aksjetegning

      // Person: Human Andrefiolin
      cy.findByRole('button', { name: /legg til person/i }).click();
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type(tenorUsers.humanAndrefiolin.ssn);
      cy.findByRole('textbox', { name: /navn/i }).type(tenorUsers.humanAndrefiolin.name.split(' ')[1]);
      cy.findByRole('button', { name: /hent opplysninger/i }).click();

      cy.findByRole('textbox', { name: /adresse/i }).type('Testveien 1');
      cy.findByRole('textbox', { name: /postnr/i }).type('0244');
      cy.findByRole('textbox', { name: /poststed/i }).should('have.value', 'OSLO');
      cy.findByTestId('group-edit-container').within(() => {
        cy.findByRole('button', { name: /lagre og lukk/i }).click();
      });

      //Person: Standhaftig Bjørnunge
      cy.findByRole('button', { name: /legg til person/i }).click();
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type(tenorUsers.standhaftigBjornunge.ssn);
      cy.findByRole('textbox', { name: /navn/i }).type(tenorUsers.standhaftigBjornunge.name.split(' ')[1]);
      cy.findByRole('button', { name: /hent opplysninger/i }).click();

      cy.findByRole('textbox', { name: /adresse/i }).type('Testveien 2');
      cy.findByRole('textbox', { name: /postnr/i }).type('0244');
      cy.findByRole('textbox', { name: /poststed/i }).should('have.value', 'OSLO');
      cy.findByTestId('group-edit-container').within(() => {
        cy.findByRole('button', { name: /lagre og lukk/i }).click();
      });

      // Virksomhet: Sivilisert Avansert Isbjørn SA
      cy.findByRole('button', { name: /legg til virksomhet/i }).click();
      cy.findByRole('textbox', { name: /organisasjonsnummer/i }).type(
        tenorOrgs['Sivilisert Avansert Isbjørn SA'].orgNr,
      );
      cy.findByRole('button', { name: /hent opplysninger/i }).click();
      cy.findByTestId('group-edit-container').within(() => {
        cy.findByRole('button', { name: /lagre og lukk/i }).click();
      });
      cy.findByRole('button', { name: /neste/i }).click();

      // Aksjekapital
      cy.findByRole('textbox', { name: /aksjekapital/i }).type('1000000');
      cy.findByRole('textbox', { name: /aksjens pålydende/i }).type('10000');
      cy.findByRole('textbox', { name: /frist for innbetaling av aksjeinnskuddet/i }).type('31.12.2030');
      cy.findByRole('button', { name: /neste/i }).click();

      // Styre
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type(tenorUsers.varsomDiameter.ssn);
      cy.findByRole('textbox', { name: /etternavn/i }).type(tenorUsers.varsomDiameter.name.split(' ')[1]);
      cy.findByRole('button', { name: /hent opplysninger/i }).click();

      cy.findByRole('radio', {
        name: /årsregnskapene skal ikke revideres og selskapet skal ikke ha revisor/i,
      }).click();
      cy.findByRole('button', { name: /neste/i }).click();

      // Stiftelsesdokumenter
      cy.findByRole('button', { name: /til signering/i }).click();

      // Signing step
      cy.findByRole('table', {
        name: /personer som skal signere hjelp personer som skal signere beskrivelse/i,
      }).within(() => {
        cy.findByRole('row', {
          name: new RegExp(`${tenorOrgs['Sivilisert Avansert Isbjørn SA'].name} venter på signering`, 'i'),
        });
        cy.findByRole('row', {
          name: new RegExp(
            `(${tenorUsers.humanAndrefiolin.name}|${reverseName(tenorUsers.humanAndrefiolin.name)}) venter på signering`,
            'i',
          ),
        });
        cy.findByRole('row', {
          name: new RegExp(
            `(${tenorUsers.standhaftigBjornunge.name}|${reverseName(tenorUsers.standhaftigBjornunge.name)}) venter på signering`,
            'i',
          ),
        });
      });

      cy.findByRole('table', { name: /dokumenter som skal signeres/i }).within(() => {
        cy.findByRole('row', {
          name: /stiftelse av aksjeselskap.pdf Skjema/i,
        });
      });

      cy.findByRole('radio', {
        name: /meg selv/i,
      }).click();

      cy.findByRole('checkbox', { name: /jeg bekrefter at informasjonen og dokumentene er korrekte/i }).click();
      cy.findByRole('button', { name: 'Signer' }).click();

      cy.findByRole('table', {
        name: /personer som skal signere hjelp personer som skal signere beskrivelse/i,
      }).within(() => {
        cy.findByRole('row', {
          name: new RegExp(
            `(${tenorUsers.humanAndrefiolin.name}|${reverseName(tenorUsers.humanAndrefiolin.name)})`,
            'i',
          ),
        }).within(() => {
          cy.findByRole('cell', { name: /Signert/i }).should('exist');
        });
      });

      cy.findByText(new RegExp(`du signerer på vegne av ${tenorOrgs['Sivilisert Avansert Isbjørn SA'].name}`, 'i'));
      cy.findByRole('checkbox', { name: /jeg bekrefter at informasjonen og dokumentene er korrekte/i }).click();
      cy.findByRole('button', { name: 'Signer' }).click();

      cy.findByText(/venter på signaturer/i);
      cy.findByText(/takk for at du signerte! du kan sende inn skjemaet når alle parter har signert/i);

      cy.hash().then((hash) => {
        cy.log('hash:', hash);
        prevHash = hash;
      });
    });

    // Step 3: Log in as one of the specified signees
    tenorUserLogin({
      appName: appFrontend.apps.signeringBrukerstyrt,
      tenorUser: tenorUsers.standhaftigBjornunge,
      authenticationLevel: '2',
    });

    cy.then(() => {
      cy.visit(`${getTargetUrl(appFrontend.apps.signeringBrukerstyrt)}${prevHash}`);
    });

    // TODO: Cannot test signing with the second user as the authorization is cached and may therefore sometimes fail
    // The first user can be tested only because their access is defined in the policy.xml file

    // Step 4: Complete the signing process

    // Verify that the signing was successful

    cy.allowFailureOnEnd();
  });
});
