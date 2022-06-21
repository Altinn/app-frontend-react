/// <reference types='cypress' />
/// <reference types="../../support" />

import AppFrontend from '../../pageobjects/app-frontend';
import * as texts from '../../fixtures/texts.json';

const appFrontend = new AppFrontend();

describe('Attachments in repeating groups', () => {
  const addNewGotoSecondPage = () => {
    cy.get(appFrontend.group.addNewItem).should('be.visible').click();
    cy.get(appFrontend.group.mainGroup)
      .siblings(appFrontend.group.editContainer)
      .find(appFrontend.group.next)
      .should('be.visible')
      .click();
  };

  beforeEach(() => {
    cy.navigateToTask3();
    cy.get(appFrontend.group.showGroupToContinue).then((checkbox) => {
      cy.get(checkbox).should('be.visible').find('input').check();
    });
    addNewGotoSecondPage();
  });

  const makeTestFile = (fileName) => ({
    fileName,
    mimeType: 'application/pdf',
    lastModified: Date.now(),
    contents: Cypress.Buffer.from('hello world'),
  });

  it('Should allow for a single uploaded attachment', () => {
    const fileName1 = 'singleFileInFirstRow.pdf';
    cy.get(appFrontend.group.uploadSingle.firstRow.dropZoneContainer).should('be.visible');
    cy.get(appFrontend.group.uploadSingle.firstRow.dropZone).selectFile(makeTestFile(fileName1), { force: true });
    cy.get(appFrontend.group.uploadSingle.firstRow.uploadStatus)
      .should('be.visible')
      .should('contain.text', texts.finishedUploading);
    cy.get(appFrontend.group.uploadSingle.firstRow.uploadedName)
      .should('be.visible')
      .should('contain.text', fileName1);
    cy.get(appFrontend.group.uploadSingle.firstRow.tableRowPreview)
      .should('be.visible')
      .should('contain.text', fileName1);
    cy.get(appFrontend.group.saveMainGroup).click();

    addNewGotoSecondPage();

    const fileName2 = 'singleFileInSecondRow.pdf';
    cy.get(appFrontend.group.uploadSingle.secondRow.dropZoneContainer).should('be.visible');
    cy.get(appFrontend.group.uploadSingle.secondRow.dropZone).selectFile(makeTestFile(fileName2), { force: true });
    cy.get(appFrontend.group.uploadSingle.secondRow.uploadStatus)
      .should('be.visible')
      .should('contain.text', texts.finishedUploading);
    cy.get(appFrontend.group.uploadSingle.secondRow.uploadedName)
      .should('be.visible')
      .should('contain.text', fileName2);
    cy.get(appFrontend.group.saveMainGroup).click();

    cy.get(appFrontend.group.uploadSingle.firstRow.tableRowPreview)
      .should('be.visible')
      .should('contain.text', fileName1);
    cy.get(appFrontend.group.uploadSingle.secondRow.tableRowPreview)
      .should('be.visible')
      .should('contain.text', fileName2);
  });
});
