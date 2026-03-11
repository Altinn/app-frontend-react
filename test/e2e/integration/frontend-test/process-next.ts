import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

import type { IncomingApplicationMetadata } from 'src/features/applicationMetadata/types';

const appFrontend = new AppFrontend();

describe('Process/next', () => {
  it('Failed PDF generation should cause unknown error for old nuget versions', () => {
    cy.allowFailureOnEnd();
    cy.intercept('GET', '**/applicationmetadata', (req) =>
      req.reply((res) => {
        res.body.altinnNugetVersion = '8.0.0.0';
        res.send();
      }),
    );

    cy.goto('message');

    cy.intercept('PUT', '**/process/next*', (req) =>
      req.reply({ statusCode: 500, body: { detail: 'Pdf generation failed' } }),
    );

    cy.findByRole('button', { name: 'Send inn' }).click();
    cy.findByRole('heading', { name: 'Ukjent feil' }).should('exist');
  });

  it('Failed PDF generation should show toast for new nuget versions', () => {
    cy.intercept('GET', '**/applicationmetadata', (req) =>
      req.reply((res) => {
        res.body.altinnNugetVersion = '8.1.0.115';
        res.send();
      }),
    );

    cy.goto('message');

    cy.intercept('PUT', '**/process/next*', (req) =>
      req.reply({ statusCode: 500, body: { detail: 'Pdf generation failed' } }),
    );

    cy.findByRole('button', { name: 'Send inn' }).click();
    cy.get(appFrontend.toast).should('contain.text', 'Noe gikk galt under innsendingen, prøv igjen om noen minutter');
    cy.findByRole('heading', { name: 'Ukjent feil' }).should('not.exist');
  });

  it('Task validations returned from process/next should be visible immediately', () => {
    // Regression test: previously, UpdateShowAllErrors could turn off showAllBackendErrors immediately
    // on its first render (when taskValidations was still empty in the zustand store), causing the
    // error report to disappear before the task validations were actually rendered..
    //
    // This bug seemingly relied on two things:
    // 1. That no data models are writable. A trick to achieve this is to make it seem there are no data models at all:
    cy.intercept('GET', '**/applicationmetadata', (req) =>
      req.reply((res) => {
        const body = res.body as IncomingApplicationMetadata;
        body.dataTypes = body.dataTypes.map((dt) => ({ ...dt, appLogic: undefined }));
        res.send();
      }),
    );

    // 2. That no components support validation. This is achieved by only having Button components in the layout.
    cy.interceptLayout('message', undefined, (layoutSet) => {
      layoutSet['neverDisplayed'] = { data: { layout: [] } };
      layoutSet['taskChooser'] = { data: { layout: [] } };
      layoutSet['formLayout'] = {
        data: {
          layout: [
            {
              id: 'submit',
              type: 'Button',
              textResourceBindings: {
                title: 'Send inn',
              },
            },
          ],
        },
      };

      // Verify our assumptions about the layout, in case a new page is added later on
      for (const pageKey of Object.keys(layoutSet)) {
        const numOthers = layoutSet[pageKey].data.layout.filter((component) => component.type !== 'Button').length;
        if (numOthers > 0) {
          throw new Error(`Unexpected components on page ${pageKey}: ${numOthers}`);
        }
      }
    });

    cy.goto('message');

    cy.intercept(
      { method: 'PUT', url: '**/process/next*', times: 1 },
      {
        statusCode: 409,
        body: {
          validationIssues: [
            {
              severity: 1,
              code: 'error',
              description: 'task validation from process next',
              source: 'Whatever',
            },
          ],
        },
      },
    );

    cy.findByRole('button', { name: 'Send inn' }).click();

    // Error report should appear immediately, showing the task validation
    cy.get(appFrontend.errorReport).should('contain.text', 'task validation from process next');
  });
});
