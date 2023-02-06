import dot from 'dot-object';

import AppFrontend from 'test/e2e/pageobjects/app-frontend';

import type { IFormData } from 'src/features/form/data';
import type { IBackendFeaturesState } from 'src/shared/resources/backendFeatures';

const appFrontend = new AppFrontend();

interface MultipartReq {
  dataModel: IFormData;
  previousValues: IFormData;
}

describe('Multipart save', () => {
  const requests: MultipartReq[] = [];

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
        const { dataModel, previousValues } = dirtyMultiPartParser(contentType, req.body);
        requests.push({
          dataModel: dot.dot(dataModel),
          previousValues,
        });
        req.body = JSON.stringify(dataModel);
        req.headers['content-type'] = 'application/json';
        delete req.headers['content-length'];
      }
      req.continue();
    }).as('multipartSave');
  }
  function expectSave(key: string, newValue: any, prevValue: any) {
    cy.waitUntil(() => requests.length > 0).then(() => {
      cy.log('Checking that', key, 'equals', newValue);
      const req = requests.shift();
      if (!req) {
        throw new Error(`No request to shift off the start`);
      }

      const val = req.dataModel[key];
      if (val !== newValue && val === undefined) {
        // This will probably help in debugging, in case something goes wrong
        throw new Error(`Found no such key: ${key}`);
      }

      expect(val).to.equal(newValue);
      expect(req.previousValues).to.deep.equal({
        [key]: prevValue,
      });
    });
  }

  it('Multipart saving with groups', () => {
    cy.goto('group');

    // We need to reload the app for it to recognize the features changed. We don't expect the backend features to
    // change while a user is working in the same session, so there is no automatic detection for this.
    simulateMultipartSave();
    cy.reload();

    cy.get(appFrontend.nextButton).click();

    // Checking the checkbox should update with a 'null' previous value
    const root = 'Endringsmelding-grp-9786';
    const showGroupKey = `${root}.Avgiver-grp-9787.KontaktpersonEPost-datadef-27688.value`;
    cy.get(appFrontend.group.showGroupToContinue).find('input').check().blur();
    expectSave(showGroupKey, 'Ja', null);

    // And then unchecking it should do the inverse
    cy.get(appFrontend.group.showGroupToContinue).find('input').uncheck().blur();
    expectSave(showGroupKey, undefined, 'Ja');

    cy.get(appFrontend.group.showGroupToContinue).find('input').check().blur();
    expectSave(showGroupKey, 'Ja', null);

    const groupKey = `${root}.OversiktOverEndringene-grp-9788`;
    const currentValueKey = 'SkattemeldingEndringEtterFristOpprinneligBelop-datadef-37131.value';
    const newValueKey = 'SkattemeldingEndringEtterFristNyttBelop-datadef-37132.value';
    const subGroupKey = 'nested-grp-1234';
    const commentKey = 'SkattemeldingEndringEtterFristKommentar-datadef-37133.value';

    // Add a simple item to the group
    cy.addItemToGroup(1, 2, 'first comment');
    expectSave(`${groupKey}[0].${currentValueKey}`, '1', null);
    expectSave(`${groupKey}[0].${newValueKey}`, '2', null);
    expectSave(`${groupKey}[0].${subGroupKey}[0].source`, 'altinn', null);
    expectSave(`${groupKey}[0].${subGroupKey}[0].${commentKey}`, 'first comment', null);

    cy.addItemToGroup(1234, 5678, 'second comment');
    expectSave(`${groupKey}[1].${currentValueKey}`, '1234', null);
    expectSave(`${groupKey}[1].${newValueKey}`, '5678', null);
    expectSave(`${groupKey}[1].${subGroupKey}[0].source`, 'altinn', null);
    expectSave(`${groupKey}[1].${subGroupKey}[0].${commentKey}`, 'second comment', null);

    // Ensure there are no more save requests in the queue afterwards
    cy.waitUntil(() => requests.length === 0);
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
