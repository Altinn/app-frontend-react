import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

import type { IDataModelMultiPatchResponse, IDataModelPatchResponse } from 'src/features/formData/types';
import type { BackendValidationIssue } from 'src/features/validation';
import type { CompExternal } from 'src/layout/layout';

const appFrontend = new AppFrontend();
const scenarios = [
  {
    page: 'PersonLookupPage',
    id: 'personLookup',
    type: 'PersonLookup',
    bindings: {
      person_lookup_ssn: { field: 'GridExample.ExampleInputTwo', dataType: 'model' },
      person_lookup_name: { field: 'street', dataType: 'model' },
      person_lookup_first_name: { field: 'nestedInput', dataType: 'model' },
      person_lookup_middle_name: { field: 'nestedInput2', dataType: 'model' },
      person_lookup_last_name: { field: 'nestedInput3', dataType: 'model' },
    },
    rowBindings: {
      person_lookup_ssn: { field: 'ListGroupExample.profession', dataType: 'model' },
      person_lookup_name: { field: 'ListGroupExample.surname', dataType: 'model' },
    },
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
    bindings: {
      organisation_lookup_orgnr: { field: 'inputfield', dataType: 'model' },
      organisation_lookup_name: { field: 'shortAnswerInput', dataType: 'model' },
    },
    rowBindings: {
      organisation_lookup_orgnr: { field: 'ListGroupExample.profession', dataType: 'model' },
      organisation_lookup_name: { field: 'ListGroupExample.surname', dataType: 'model' },
    },
    numberLabel: /Organisasjonsnummer/i,
    number: '043871668',
    required: 'Du må fylle ut organisasjonsnummer og hente opplysninger',
    method: 'GET',
    url: '**/api/v1/lookup/organisation/*',
    success: { success: true, organisationDetails: { orgNr: '043871668', name: 'Skog og Fjell Consulting' } },
  },
] as const;

function layout(scenario: (typeof scenarios)[number]): CompExternal[] {
  const lookup = (repeated = false): CompExternal => {
    const common = {
      id: repeated ? `${scenario.id}-repeated` : scenario.id,
      textResourceBindings: { title: 'Lookup validation' },
      required: false,
    };
    return scenario.type === 'PersonLookup'
      ? { ...common, type: 'PersonLookup', dataModelBindings: repeated ? scenario.rowBindings : scenario.bindings }
      : {
          ...common,
          type: 'OrganisationLookup',
          dataModelBindings: repeated ? scenario.rowBindings : scenario.bindings,
        };
  };
  return [
    { id: `${scenario.id}-navigation`, type: 'NavigationBar' },
    lookup(),
    {
      id: `${scenario.id}-group`,
      type: 'RepeatingGroup',
      dataModelBindings: { group: { field: 'ListGroupExample', dataType: 'model' } },
      children: [`${scenario.id}-repeated`],
      validateOnSaveRow: ['All'],
    },
    lookup(true),
    {
      id: `${scenario.id}-next`,
      type: 'NavigationButtons',
      textResourceBindings: { next: 'Neste' },
      validateOnNext: { page: 'current', show: ['All'] },
    },
  ];
}

function interceptBackendErrors(fields: string[]) {
  return cy
    .intercept({ method: 'PATCH', url: /\/instances\/[^/]+\/[^/]+\/data(?:\/[^?]+)?(?:\?|$)/, times: 1 }, (req) => {
      req.on('before:response', (res) => {
        const body = res.body as IDataModelMultiPatchResponse | IDataModelPatchResponse;
        const dataElementId =
          'patches' in req.body ? req.body.patches[0].dataElementId : new URL(req.url).pathname.split('/').at(-1);
        const issues: BackendValidationIssue[] = fields.map((field) => ({
          field,
          dataElementId,
          severity: 1,
          source: 'lookup-test',
          description: `Backend error for ${field}`,
        }));
        if (Array.isArray(body.validationIssues)) {
          body.validationIssues.push({ source: 'lookup-test', issues });
        } else {
          body.validationIssues['lookup-test'] = issues;
        }
      });
    })
    .as('saveLookup');
}

describe('Lookup validation', { testIsolation: false }, () => {
  before(() => {
    // Reuse the unchanged component-library model and one instance for the whole suite.
    cy.interceptLayout('ComponentLayouts', undefined, (layouts) => {
      for (const scenario of scenarios) {
        layouts[scenario.page].data.layout = layout(scenario);
      }
    });
    cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
  });

  for (const scenario of scenarios) {
    describe(scenario.type, () => {
      beforeEach(() => {
        // Unmount drafts, then clear saved data and rows from the preceding case.
        cy.gotoNavPage(scenarios.find((other) => other !== scenario)!.page);
        cy.gotoNavPage(scenario.page);
        cy.changeLayout((component) => {
          if (component.type === scenario.type) {
            component.required = false;
            component.showValidations = undefined;
          }
        });
        cy.get(`[data-componentid="${scenario.id}"]`).then(($lookup) => {
          if ($lookup.find('button').filter((_, button) => button.textContent?.includes('Fjern')).length) {
            cy.get(`[data-componentid="${scenario.id}"]`).findByRole('button', { name: /Fjern/ }).click();
          }
        });
        cy.get(`[data-componentid="${scenario.id}-group"]`).then(($group) => {
          const count = $group.find('button').filter((_, button) => button.textContent?.includes('Slett')).length;
          for (let row = 0; row < count; row++) {
            cy.get(`[data-componentid="${scenario.id}-group"]`)
              .findAllByRole('button', { name: /Slett/ })
              .first()
              .click();
            cy.get(`[data-componentid="${scenario.id}-group"]`)
              .find('button')
              .filter((_, button) => button.textContent?.includes('Slett') ?? false)
              .should('have.length', count - row - 1);
          }
        });
        cy.waitUntilSaved();
      });

      function fill() {
        cy.findByRole('textbox', { name: scenario.numberLabel }).type(scenario.number);
        if (scenario.type === 'PersonLookup') {
          cy.findByRole('textbox', { name: /Etternavn/i }).type('Forelder');
        }
      }

      function requireLookups(required: boolean) {
        cy.changeLayout((component) => {
          if (component.type === scenario.type) {
            component.required = required;
          }
        });
      }

      it('shows required errors at the page gate and permits optional empty lookups', () => {
        requireLookups(true);
        cy.findByRole('button', { name: 'Neste' }).click();
        cy.get(`[data-componentid="${scenario.id}"]`).within(() => {
          cy.findByText(scenario.required).should('be.visible');
          cy.get(`#${scenario.id}-validations`).should('have.length', 1);
          cy.findByRole('textbox', { name: scenario.numberLabel })
            .should('have.attr', 'aria-invalid', 'true')
            .and('have.attr', 'aria-describedby', `${scenario.id}-validations`);
        });
        requireLookups(false);
        cy.get(`[data-componentid="${scenario.id}"]`).findByText(scenario.required).should('not.exist');
        cy.findByRole('button', { name: 'Neste' }).click();
        cy.get(`[data-componentid="${scenario.id}"]`).should('not.exist');
      });

      it('shows indexed required errors at the row gate and permits optional empty rows', () => {
        requireLookups(true);
        cy.findByRole('button', { name: /Legg til ny/ }).click();
        cy.get('[data-testid="group-edit-container"]').within(() => {
          cy.findByRole('button', { name: /Lagre og lukk/ }).click();
          cy.findByText(scenario.required).should('be.visible');
          cy.get(`#${scenario.id}-repeated-0-validations`).should('have.length', 1);
          cy.findByRole('textbox', { name: scenario.numberLabel })
            .should('have.attr', 'aria-invalid', 'true')
            .and('have.attr', 'aria-describedby', `${scenario.id}-repeated-0-validations`);
        });
        cy.get(`[data-componentid="${scenario.id}"]`).findByText(scenario.required).should('not.exist');
        requireLookups(false);
        cy.get(`[data-componentid="${scenario.id}-group"]`)
          .findByRole('button', { name: /Rediger/ })
          .click();
        cy.get('[data-testid="group-edit-container"]')
          .findByRole('button', { name: /Lagre og lukk/ })
          .click();
        cy.get('[data-testid="group-edit-container"]').should('not.exist');
      });

      it('validates drafts locally before requesting a lookup and clears errors on edit', () => {
        cy.intercept(scenario.method, scenario.url, cy.spy().as('lookupRequest'));
        cy.get(`[data-componentid="${scenario.id}"]`).within(() => {
          cy.findByRole('textbox', { name: scenario.numberLabel }).type('123');
          cy.findByRole('button', { name: /Hent opplysninger/i }).click();
          cy.findByText(/nummeret.*ugyldig/i).should('be.visible');
          if (scenario.type === 'PersonLookup') {
            cy.findByText('Etternavn kan ikke være tomt.').should('be.visible');
            cy.findByRole('textbox', { name: /Etternavn/i }).type('Forelder');
            cy.findByText('Etternavn kan ikke være tomt.').should('not.exist');
          }
          cy.findByRole('textbox', { name: scenario.numberLabel }).type('4');
          cy.findByText(/nummeret.*ugyldig/i).should('not.exist');
          cy.findByRole('button', { name: /Hent opplysninger/i }).click();
          cy.findByText(/nummeret.*ugyldig/i).should('be.visible');
        });
        cy.get('@lookupRequest').should('not.have.been.called');
      });

      it('loses unsubmitted inputs when navigating away', () => {
        cy.get(`[data-componentid="${scenario.id}"]`).within(() => fill());
        cy.gotoNavPage(scenarios.find((other) => other !== scenario)!.page);
        cy.gotoNavPage(scenario.page);
        cy.get(`[data-componentid="${scenario.id}"]`).within(() => {
          cy.findByRole('textbox', { name: scenario.numberLabel }).should('have.value', '');
          if (scenario.type === 'PersonLookup') {
            cy.findByRole('textbox', { name: /Etternavn/i }).should('have.value', '');
          }
        });
      });

      for (const repeated of [false, true]) {
        it(`shows all binding errors once beneath ${repeated ? 'a repeated' : 'a standalone'} saved lookup`, () => {
          cy.intercept({ method: scenario.method, url: scenario.url, times: 1 }, scenario.success).as('lookup');
          if (repeated) {
            cy.findByRole('button', { name: /Legg til ny/ }).click();
          }
          cy.waitUntilSaved();
          const bindings = repeated ? scenario.rowBindings : scenario.bindings;
          const fields = Object.values(bindings).map(({ field }) =>
            field.replace('ListGroupExample.', 'ListGroupExample[0].'),
          );
          const componentId = repeated ? `${scenario.id}-repeated-0` : scenario.id;
          // Preserve the actual saved model. Only add backend errors to this one response.
          interceptBackendErrors(fields);
          cy.get(`[data-componentid="${componentId}"]`).within(() => {
            fill();
            cy.findByRole('button', { name: /Hent opplysninger/i }).click();
            cy.wait('@lookup');
            cy.wait('@saveLookup').its('response.statusCode').should('eq', 200);
            cy.findByRole('button', { name: /Fjern/i }).should('be.visible');
            for (const field of fields) {
              cy.findByText(`Backend error for ${field}`).should('be.visible');
            }
            cy.get(`#${componentId}-validations`).find('li').should('have.length', fields.length);
            cy.findByRole('textbox', { name: scenario.numberLabel })
              .should('have.attr', 'aria-invalid', 'true')
              .invoke('attr', 'aria-describedby')
              .should('contain', `${componentId}-validations`);
          });
          if (repeated) {
            cy.get('[data-testid="group-edit-container"]')
              .findByRole('button', { name: /Lagre og lukk/ })
              .click();
            cy.get('[data-testid="group-edit-container"]').should('be.visible');
          } else {
            cy.gotoNavPage(scenarios.find((other) => other !== scenario)!.page);
            cy.gotoNavPage(scenario.page);
            cy.get(`[data-componentid="${componentId}"]`)
              .findByRole('textbox', { name: scenario.numberLabel })
              .should('have.value', scenario.number);
          }
          // An incremental validator must return its empty issue group to clear its previous errors.
          interceptBackendErrors([]);
          cy.get(`[data-componentid="${componentId}"]`).findByRole('button', { name: /Fjern/i }).click();
          cy.wait('@saveLookup');
          cy.waitUntilSaved();
          cy.get(`[data-componentid="${componentId}"]`).within(() => {
            cy.get(`#${componentId}-validations`).should('not.exist');
            cy.findByRole('textbox', { name: scenario.numberLabel }).should('have.attr', 'aria-invalid', 'false');
          });
        });
      }
    });
  }
});
