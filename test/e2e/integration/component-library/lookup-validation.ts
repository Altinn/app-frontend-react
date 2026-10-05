import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

import type {
  IDataModelMultiPatchRequest,
  IDataModelMultiPatchResponse,
  IDataModelPatchRequest,
  IDataModelPatchResponse,
} from 'src/features/formData/types';

const appFrontend = new AppFrontend();
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

for (const scenario of scenarios) {
  describe(`${scenario.type} validation gates`, () => {
    function start() {
      cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
      cy.gotoNavPage(scenario.page);
    }

    function fill() {
      cy.findByRole('textbox', { name: scenario.numberLabel }).type(scenario.number);
      if (scenario.type === 'PersonLookup') {
        cy.findByRole('textbox', { name: /Etternavn/i }).type('Forelder');
      }
    }

    function injectBackendErrors(prefix: string) {
      cy.intercept('PATCH', /\/instances\/[^/]+\/[^/]+\/data(?:\/[^?]+)?(?:\?|$)/, (req) => {
        const request = req.body as IDataModelMultiPatchRequest | IDataModelPatchRequest;
        const dataElementId =
          'patches' in request ? request.patches[0].dataElementId : req.url.match(/\/data\/([^?]+)/)?.[1];
        req.on('response', (res) => {
          expect(res.statusCode).to.eq(200);
          const response = res.body as IDataModelMultiPatchResponse | IDataModelPatchResponse;
          const issues = scenario.fields.map((field) => ({
            source: 'LookupTestValidator',
            field: `${prefix}.${field}`,
            dataElementId,
            severity: 1 as const,
            customTextKey: `Backend error for ${field}`,
          }));
          if (Array.isArray(response.validationIssues)) {
            response.validationIssues.push({ source: 'LookupTestValidator', issues });
          } else {
            response.validationIssues.LookupTestValidator = issues;
          }
          res.send(response);
        });
      });
    }

    it('changes required validation using the radio buttons', () => {
      start();
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
      start();
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
        cy.intercept(scenario.method, scenario.url, scenario.success).as('lookup');
        // The lookup's own gate must reveal errors without showValidations configuration.
        cy.interceptLayout('ComponentLayouts', (component) => {
          if (component.type === scenario.type) {
            component.showValidations = [];
          }
        });
        start();
        if (repeated) {
          cy.findByRole('button', { name: /Legg til ny/ }).click();
        }
        injectBackendErrors(repeated ? `${scenario.rows}[0]` : scenario.model);
        const componentId = repeated ? `${scenario.id}-repeated-0` : scenario.id;
        cy.get(`[data-componentid="${componentId}"]`).within(() => {
          fill();
          cy.findByRole('button', { name: /Hent opplysninger/i }).click();
          cy.wait('@lookup');
          for (const field of scenario.fields) {
            cy.findByText(`Backend error for ${field}`).should('be.visible');
          }
          cy.findByRole('textbox', { name: scenario.numberLabel }).should('have.attr', 'aria-invalid', 'true');
          cy.findByRole('button', { name: /Fjern/i }).should('be.visible');
        });
        if (repeated) {
          cy.get('[data-testid="group-edit-container"]').within(() => {
            cy.findByRole('button', { name: /Lagre og lukk/ }).click();
            cy.findByText(`Backend error for ${scenario.fields[0]}`).should('be.visible');
          });
        }
      });
    }
  });
}
