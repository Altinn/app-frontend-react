/// <reference types='cypress' />
/// <reference types="../../support" />

import AppFrontend from '../../pageobjects/app-frontend';
import * as texts from '../../fixtures/texts.json';

const appFrontend = new AppFrontend();

describe('Repeating group attachments', () => {
  const addNewRow = () => {
    cy.get(appFrontend.group.addNewItem).should('be.visible').click();
  };

  const gotoSecondPage = () => {
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
    addNewRow();
    gotoSecondPage();
  });

  const makeTestFile = (fileName) => ({
    fileName,
    mimeType: 'application/pdf',
    lastModified: Date.now(),
    contents: Cypress.Buffer.from('hello world'),
  });

  const verifyTableRowPreview = (item, fileName, deletedAttachments) => {
    if (deletedAttachments && deletedAttachments.includes(fileName)) {
      cy.get(item.tableRowPreview)
        .should('be.visible')
        .should('not.contain.text', fileName);
    } else {
      cy.get(item.tableRowPreview)
        .should('be.visible')
        .should('contain.text', fileName);
    }
  };

  const uploadFile = (item, attachmentIndex, fileName, verifyTableRow) => {
    cy.get(item.dropZoneContainer).should('be.visible');
    cy.get(item.dropZone).selectFile(makeTestFile(fileName), { force: true });
    cy.get(item.attachments[attachmentIndex].status)
      .should('be.visible')
      .should('contain.text', texts.finishedUploading);
    cy.get(item.attachments[attachmentIndex].name)
      .should('be.visible')
      .should('contain.text', fileName);
    if (verifyTableRow) {
      verifyTableRowPreview(item, fileName);
    }
  };

  it('Works when uploading attachments to repeating groups, supports deleting attachments and entire rows', () => {
    const filenames = [
      {
        single: 'singleFileInFirstRow.pdf',
        multi: [
          'multiInFirstRow1.pdf',
          'multiInFirstRow2.pdf',
          'multiInFirstRow3.pdf',
        ]
      },
      {
        single: 'singleFileInSecondRow.pdf',
        multi: [
          'multiInSecondRow1.pdf',
          'multiInSecondRow2.pdf',
          'multiInSecondRow3.pdf',
          'multiInSecondRow4.pdf',
        ]
      }
    ];

    uploadFile(appFrontend.group.rows[0].uploadSingle, 0, filenames[0].single, true);
    filenames[0].multi.forEach((fileName, idx) => {
      uploadFile(appFrontend.group.rows[0].uploadMulti, idx, fileName, true);
      if (idx !== filenames[0].multi.length - 1) {
        cy.get(appFrontend.group.rows[0].uploadMulti.addMoreBtn).click();
      }
    });

    cy.get(appFrontend.group.saveMainGroup).click();
    addNewRow();
    gotoSecondPage();

    uploadFile(appFrontend.group.rows[1].uploadSingle, 0, filenames[1].single, true);
    filenames[1].multi.forEach((fileName, idx) => {
      uploadFile(appFrontend.group.rows[1].uploadMulti, idx, fileName, true);
      if (idx !== filenames[1].multi.length - 1) {
        cy.get(appFrontend.group.rows[1].uploadMulti.addMoreBtn).click();
      }
    });
    cy.get(appFrontend.group.saveMainGroup).click();

    const deletedAttachmentNames = [];
    const verifyPreview = () => {
      verifyTableRowPreview(appFrontend.group.rows[0].uploadSingle, filenames[0].single, deletedAttachmentNames);
      verifyTableRowPreview(appFrontend.group.rows[1].uploadSingle, filenames[1].single, deletedAttachmentNames);
      verifyTableRowPreview(appFrontend.group.rows[0].uploadMulti, filenames[0].multi[0], deletedAttachmentNames);
      verifyTableRowPreview(appFrontend.group.rows[0].uploadMulti, filenames[0].multi[1], deletedAttachmentNames);
      verifyTableRowPreview(appFrontend.group.rows[0].uploadMulti, filenames[0].multi[2], deletedAttachmentNames);
      verifyTableRowPreview(appFrontend.group.rows[1].uploadMulti, filenames[1].multi[0], deletedAttachmentNames);
      verifyTableRowPreview(appFrontend.group.rows[1].uploadMulti, filenames[1].multi[1], deletedAttachmentNames);
      verifyTableRowPreview(appFrontend.group.rows[1].uploadMulti, filenames[1].multi[2], deletedAttachmentNames);
      verifyTableRowPreview(appFrontend.group.rows[1].uploadMulti, filenames[1].multi[3], deletedAttachmentNames);
    };

    verifyPreview();

    cy.get(appFrontend.group.rows[0].editBtn).click();
    gotoSecondPage();

    // Now that all attachments described above have been uploaded and verified, start deleting the middle attachment
    // of the first-row multi-uploader to verify that the next attachment is shifted upwards.
    cy.get(appFrontend.group.rows[0].uploadMulti.attachments[1].deleteBtn).click();
    deletedAttachmentNames.push(filenames[0].multi[1]);

    // The next attachment filename should now replace the deleted one:
    cy.get(appFrontend.group.rows[0].uploadMulti.attachments[1].name)
      .should('be.visible')
      .should('contain.text', filenames[0].multi[2]);

    verifyPreview();

    // TODO: Verify that the now deleted attachment is gone (deleted via request)

    // TODO: Intercept the formData and verify that the attachment references are set correctly in the data model
    // TODO: Reload the page and verify that attachments are mapped correctly
    // TODO: Test uploading in nested groups
    // TODO: Test deleting an entire row, and that attachments are shifted upwards
    // TODO: Test that deleting an entire first-level row also deletes nested attachments
    // TODO: Test adding a new row after deleting a row and verify that there are now attachments in the new row
    // TODO: Test that there are no nested attachments in a new row after deleting a row
  });
});
