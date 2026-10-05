import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

import type {
  IDataModelMultiPatchRequest,
  IDataModelMultiPatchResponse,
  IDataModelPatchRequest,
  IDataModelPatchResponse,
} from 'src/features/formData/types';

const appFrontend = new AppFrontend();
const backendMessages = {
  Ssn: 'Feil fra serveren for fødselsnummer.',
  FullName: 'Feil fra serveren for navn.',
  FirstName: 'Feil fra serveren for fornavn.',
  MiddleName: 'Feil fra serveren for mellomnavn.',
  LastName: 'Feil fra serveren for etternavn.',
  OrgNr: 'Feil fra serveren for organisasjonsnummer.',
  Name: 'Feil fra serveren for organisasjonsnavn.',
};

const scenarios = [
  {
    page: 'PersonLookupPage',
    id: 'personLookup',
    type: 'PersonLookup',
    model: 'PersonLookup',
    rows: 'PersonLookups',
    fields: ['Ssn', 'FullName', 'FirstName', 'MiddleName', 'LastName'],
    numberLabel: /Fødselsnummer/i,
    number: '08829698278',
    required: 'Du må fylle ut fødselsnummer',
    method: 'POST',
    url: '**/api/v1/lookup/person',
    success: {
      success: true,
      personDetails: {
        ssn: '08829698278',
        name: 'Rik Forelder',
        firstName: 'Rik',
        middleName: '',
        lastName: 'Forelder',
      },
    },
  },
  {
    page: 'OrganisationLookupPage',
    id: 'organisationLookup',
    type: 'OrganisationLookup',
    model: 'OrganizationLookup',
    rows: 'OrganizationLookups',
    fields: ['OrgNr', 'Name'],
    numberLabel: /Organisasjonsnummer/i,
    number: '043871668',
    required: 'Du må fylle ut organisasjonsnummer og hente opplysninger',
    method: 'GET',
    url: '**/api/v1/lookup/organisation/*',
    success: { success: true, organisationDetails: { orgNr: '043871668', name: 'Skog og Fjell Consulting' } },
  },
] as const;

describe('Lookup validation', { testIsolation: false }, () => {
  before(() => {
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
    cy.gotoNavPage('PersonLookupPage');
    cy.findByRole('radio', { name: 'Nei' }).should('be.checked');
  });

  for (const scenario of scenarios) {
    describe(`${scenario.type} validation gates`, () => {
      beforeEach(() => {
        cy.gotoNavPage(scenario.page);
        // Keep one instance, but reset the model, pending drafts and layout between cases.
        cy.findByRole('checkbox', { name: 'Vis feil fra serveren' }).uncheck();
        cy.findByRole('radio', { name: 'Nei' }).check();
        cy.get(`[data-componentid="${scenario.id}-group"]`).then(($group) => {
          const count = $group.find('button').filter((_, button) => button.textContent?.includes('Slett')).length;
          for (let row = 0; row < count; row++) {
            cy.get(`[data-componentid="${scenario.id}-group"]`)
              .findAllByRole('button', { name: /Slett/ })
              .first()
              .click();
          }
        });
        cy.get(`[data-componentid="${scenario.id}"]`).then(($lookup) => {
          if ($lookup.find('button').filter((_, button) => button.textContent?.includes('Fjern')).length) {
            cy.get(`[data-componentid="${scenario.id}"]`).findByRole('button', { name: /Fjern/ }).click();
          }
        });
        cy.waitUntilSaved();
        cy.changeLayout((component) => {
          if (component.type === scenario.type) {
            component.showValidations = undefined;
          }
        });
      });

      function fill() {
        cy.findByRole('textbox', { name: scenario.numberLabel }).type(scenario.number);
        if (scenario.type === 'PersonLookup') {
          cy.findByRole('textbox', { name: /Etternavn/i }).type('Forelder');
        }
      }

      it('changes required validation using the radio buttons', () => {
        cy.findByRole('radio', { name: 'Nei' }).should('be.checked');
        cy.findByRole('radio', { name: 'Ja' }).check();
        cy.get(`[data-componentid="${scenario.id}"]`)
          .findByRole('textbox', { name: scenario.numberLabel })
          .should('have.attr', 'required');
        cy.findByRole('button', { name: 'Neste' }).click();
        cy.get(`[data-componentid="${scenario.id}"]`).findByText(scenario.required).should('be.visible');
        cy.findByRole('radio', { name: 'Nei' }).check();
        cy.get(`[data-componentid="${scenario.id}"]`).findByText(scenario.required).should('not.exist');
        cy.get(`[data-componentid="${scenario.id}"]`)
          .findByRole('textbox', { name: scenario.numberLabel })
          .should('not.have.attr', 'required');
        cy.findByRole('button', { name: 'Neste' }).click();
        cy.get(`[data-componentid="${scenario.id}"]`).should('not.exist');
      });

      it('validates required lookups when saving a row and permits empty optional rows', () => {
        cy.findByRole('radio', { name: 'Ja' }).check();
        cy.findByRole('button', { name: /Legg til ny/ }).click();
        cy.get('[data-testid="group-edit-container"]').within(() => {
          cy.findByRole('button', { name: /Lagre og lukk/ }).click();
          cy.findByText(scenario.required).should('be.visible');
          cy.findByRole('textbox', { name: scenario.numberLabel }).should('have.attr', 'aria-invalid', 'true');
        });
        // The row gate must not reveal required errors on the standalone lookup.
        cy.get(`[data-componentid="${scenario.id}"]`).findByText(scenario.required).should('not.exist');
        cy.findByRole('radio', { name: 'Nei' }).check();
        cy.get('[data-testid="group-edit-container"]').within(() => {
          cy.findByText(scenario.required).should('not.exist');
          cy.findByRole('button', { name: /Lagre og lukk/ }).click();
        });
        cy.get('[data-testid="group-edit-container"]').should('not.exist');
      });

      for (const repeated of [false, true]) {
        it(`shows backend errors for every binding after ${repeated ? 'a row' : 'a standalone'} lookup`, () => {
          cy.intercept({ method: scenario.method, url: scenario.url, times: 1 }, scenario.success).as('lookup');
          // The lookup's own gate must reveal errors without showValidations configuration.
          cy.changeLayout((component) => {
            if (component.type === scenario.type) {
              component.showValidations = [];
            }
          });
          if (repeated) {
            cy.findByRole('button', { name: /Legg til ny/ }).click();
          }
          cy.findByRole('checkbox', { name: 'Vis feil fra serveren' }).check();
          cy.waitUntilSaved();
          cy.intercept({ method: 'PATCH', url: /\/instances\/[^/]+\/[^/]+\/data(?:\/[^?]+)?(?:\?|$)/, times: 1 }).as(
            'saveLookup',
          );
          const componentId = repeated ? `${scenario.id}-repeated-0` : scenario.id;
          cy.get(`[data-componentid="${componentId}"]`).within(() => {
            fill();
            cy.findByRole('button', { name: /Hent opplysninger/i }).click();
            cy.wait('@lookup');
            cy.wait<
              IDataModelMultiPatchRequest | IDataModelPatchRequest,
              IDataModelMultiPatchResponse | IDataModelPatchResponse
            >('@saveLookup').then(({ response }) => {
              expect(response?.statusCode).to.eq(200);
              const issues = response?.body.validationIssues ?? {};
              const fields = Array.isArray(issues)
                ? issues.flatMap((group) => group.issues.map((issue) => issue.field))
                : Object.values(issues).flatMap((group) => group.map((issue) => issue.field));
              const prefix = repeated ? `${scenario.rows}[0]` : scenario.model;
              for (const field of scenario.fields) {
                expect(fields).to.include(`${prefix}.${field}`);
              }
            });
            for (const field of scenario.fields) {
              cy.findByText(backendMessages[field]).should('be.visible');
            }
            cy.findByRole('textbox', { name: scenario.numberLabel }).should('have.attr', 'aria-invalid', 'true');
            cy.findByRole('button', { name: /Fjern/i }).should('be.visible');
          });
          if (repeated) {
            cy.get('[data-testid="group-edit-container"]').within(() => {
              cy.findByRole('button', { name: /Lagre og lukk/ }).click();
              cy.findByText(backendMessages[scenario.fields[0]]).should('be.visible');
            });
          }
          cy.findByRole('checkbox', { name: 'Vis feil fra serveren' }).uncheck();
          cy.waitUntilSaved();
          cy.get(`[data-componentid="${componentId}"]`).within(() => {
            for (const field of scenario.fields) {
              cy.findByText(backendMessages[field]).should('not.exist');
            }
            cy.findByRole('textbox', { name: scenario.numberLabel }).should('have.attr', 'aria-invalid', 'false');
          });
          if (repeated) {
            cy.get('[data-testid="group-edit-container"]')
              .findByRole('button', { name: /Lagre og lukk/ })
              .click();
            cy.get('[data-testid="group-edit-container"]').should('not.exist');
          }
        });
      }
    });
  }
});
