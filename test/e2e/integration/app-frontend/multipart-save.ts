import AppFrontend from 'test/e2e/pageobjects/app-frontend';

import type { IBackendFeaturesState } from 'src/shared/resources/backendFeatures';

const appFrontend = new AppFrontend();

interface MultipartReq {
  dataModel: any;
  changes: { [key: string]: string };
}

describe('Multipart save', () => {
  const lastRequest: MultipartReq = {
    dataModel: {},
    changes: {},
  };

  /**
   * This is not supported by 'frontend-test' yet, so we'll simulate the functionality by intercepting the requests
   * and rewriting them to something the backend currently supports. In the process, we can verify that the
   * functionality works on the frontend.
   */
  function simulateMultipartSave() {
    const backendFeatures: IBackendFeaturesState = {
      multiPartSave: true,
    };
    cy.intercept('GET', '**/featureset', JSON.stringify(backendFeatures));

    cy.intercept('PUT', '**/instances/**/data/*', (req) => {
      const contentType = req.headers['content-type']?.toString();
      if (contentType.startsWith('multipart/form-data')) {
        const { dataModel, changes } = dirtyMultiPartParser(contentType, req.body);
        lastRequest.dataModel = dataModel;
        lastRequest.changes = changes;
        req.body = JSON.stringify(dataModel);
        req.headers['content-type'] = 'application/json';
        delete req.headers['content-length'];
      }
      req.continue();
    }).as('multipartSave');
  }

  it('Multipart saving with groups', () => {
    cy.goto('group');

    // We need to reload the app for it to recognize the features changed. We don't expect the backend features to
    // change while a user is working in the same session, so there is no automatic detection for this.
    simulateMultipartSave();
    cy.reload();

    cy.get(appFrontend.nextButton).click();
    cy.get(appFrontend.group.showGroupToContinue).find('input').check().blur();
    cy.wait('@multipartSave').then(() => {
      expect(lastRequest.changes).to.deep.equal({
        'Some.Path': 'prev-value',
      });
    });
    cy.get(appFrontend.group.addNewItem).should('be.visible');
  });
});

/**
 * Cypress does not parse the multiPart content for us, so instead of pulling in a dependency just to do that, we'll
 * just haphazardly parse it. We only care about the happy-path here anyway, and we'll let the test fail if our parsing
 * fails. This is not running in production code, just our test suite.
 */
function dirtyMultiPartParser(contentType: string, body: string): { [key: string]: any } {
  const boundaryHeader = contentType.split(';')[1];
  const boundary = boundaryHeader.split('boundary=')[1];
  const parts = body
    .split(boundary)
    .map((s) => s.trim())
    .filter((p) => p !== '--');

  const out = {};
  for (const part of parts) {
    const innerParts = part.split('\r\n\r\n', 2);
    const nameMatch = innerParts[0].match(/name=["'](.*?)["']/);
    if (nameMatch && nameMatch[1]) {
      out[nameMatch[1]] = JSON.parse(innerParts[1].replace(/--$/, ''));
    }
  }

  return out;
}
