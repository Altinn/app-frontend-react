import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import { getTargetUrl } from 'test/e2e/support/start-app-instance';

const appFrontend = new AppFrontend();

type TenorOrg = {
  name: string;
  orgNr: string;
};

const tenorOrg = {
  name: 'Sivilisert Avansert Isbjørn AS',
  orgNr: '312405091',
};

type TenorUser = {
  name: string;
  ssn: string;
  role?: string;
  org?: TenorOrg;
};

const tenorUsers: Record<string, TenorUser> = {
  humanAndrefiolin: {
    name: 'Human Andrefiolin',
    ssn: '09876298713',
    role: 'CEO',
    org: tenorOrg,
  },
  varsomDiameter: {
    name: 'Varsom Diameter',
    ssn: '03835698199',
    role: 'Chairman',
    org: tenorOrg,
  },
  standhaftigBjornunge: {
    name: 'Standhaftig Bjørnunge',
    ssn: '23849199013',
  },
};

function reverseName(name: string): string {
  return name.split(' ').reverse().join(' ');
}

function tenorLogin(user: TenorUser) {
  cy.startAppInstance(appFrontend.apps.signeringBrukerstyrt, { user: null });
  cy.findByRole('link', {
    name: /testid lag din egen testbruker/i,
  }).click();

  cy.findByRole('textbox', {
    name: /personidentifikator \(syntetisk\)/i,
  }).type(user.ssn);

  cy.findByRole('button', {
    name: /autentiser/i,
  }).click();

  cy.findByText(new RegExp(reverseName(user.name), 'i')).click();
  cy.waitForLoad();

  cy.findByText(new RegExp(reverseName(user.name), 'i')).click();
}

describe('Signing', () => {
  it('should allow signing by a specified signee', () => {
    // Step 1: Log in as the initial user
    tenorLogin(tenorUsers.standhaftigBjornunge);

    let prevHash: string;
    cy.log(window.location.toString());
    // // Step 2: Fill in the form and specify other valid users as signees
    // Om selskapet
    cy.url().then(() => {
      cy.findByRole('textbox', { name: /navn/i }).type('Testselskap AS');
      cy.findByRole('button', { name: /neste/i }).click();

      // Stiftere og aksjetegning
      cy.findByRole('button', { name: /legg til person/i }).click();
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type(tenorUsers.humanAndrefiolin.ssn);
      cy.findByRole('textbox', { name: /navn/i }).type(tenorUsers.humanAndrefiolin.name.split(' ')[1]);
      cy.findByRole('button', { name: /hent opplysninger/i }).click();

      cy.findByRole('textbox', { name: /adresse/i }).type('Testveien 1');
      cy.findByRole('textbox', { name: /postnr/i }).type('0244');
      cy.waitForLoad();
      cy.findByTestId('group-edit-container').within(() => {
        cy.findByRole('button', { name: /lagre og lukk/i }).click();
      });

      cy.findByRole('button', { name: /legg til virksomhet/i }).click();
      cy.findByRole('textbox', { name: /organisasjonsnummer/i }).type(tenorOrg.orgNr);
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
      // Submit the form to proceed to the signing step
      cy.findByRole('button', { name: /til signering/i }).click();
      cy.waitForLoad();

      // Signing step
      cy.findByRole('table', {
        name: /personer som skal signere hjelp personer som skal signere beskrivelse/i,
      }).within(() => {
        cy.findByRole('row', {
          name: /sivilisert avansert isbjørn sa venter på signering/i,
        });
        cy.findByRole('row', {
          name: /andrefiolin human venter på signering/i,
        });
      });

      cy.findByRole('table', { name: /dokumenter som skal signeres/i }).within(() => {
        cy.findByRole('row', {
          name: /stiftelse av aksjeselskap.pdf Skjema/i,
        });
      });

      cy.findByRole('checkbox', { name: /jeg bekrefter at informasjonen og dokumentene er korrekte/i }).click();
      cy.findByRole('button', { name: /signer skjemaet/i }).click();
      cy.waitForLoad();
      cy.findByRole('table', {
        name: /personer som skal signere hjelp personer som skal signere beskrivelse/i,
      }).within(() => {
        cy.findByRole('row', { name: new RegExp(reverseName(tenorUsers.standhaftigBjornunge.name), 'i') }).within(
          () => {
            cy.findByRole('cell', { name: /signert/i }).should('exist');
          },
        );
      });

      cy.findByText(/venter på signaturer/i);
      cy.findByText(/takk for at du signerte! du kan sende inn skjemaet når alle parter har signert/i);

      cy.hash().then((hash) => {
        cy.log('hash:', hash);
        prevHash = hash;
      });
    });

    // Step 3: Log in as one of the specified signees
    tenorLogin(tenorUsers.humanAndrefiolin);
    cy.reloadAndWait();

    cy.then(() => {
      cy.visit(`${getTargetUrl(appFrontend.apps.signeringBrukerstyrt)}${prevHash}`);
    });

    cy.reloadAndWait();

    // TODO: Cannot test this yet, as the authorization is cached and may therefore sometimes fail
    // cy.findByRole('button', { name: /signer/i }).click();

    // Step 4: Complete the signing process

    // Verify that the signing was successful
  });
});
