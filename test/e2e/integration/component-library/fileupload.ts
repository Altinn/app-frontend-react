import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

// describe('Group summary test', () => {
//   beforeEach(() => {
//     cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
//     cy.get('#navigation-menu').find('button').contains('9. FileUploadPage').click();
//   });
//   const makeTestFile = (fileName: string) => ({
//     fileName,
//     mimeType: 'application/pdf',
//     lastModified: Date.now(),
//     contents: Cypress.Buffer.from('hello world'),
//   });
//
//   const uploadFile = ({ fileName }: IUploadFileArgs) => {
//     cy.get(appFrontend.fileUploader.dropZoneContainer).should('be.visible');
//     cy.get(appFrontend.fileUploader.dropZone).selectFile(makeTestFile(fileName), { force: true });
//     cy.wait('@upload');
//     cy.get(appFrontend.fileUploader.status).should('contain.text', 'Finished uploading');
//     cy.get(appFrontend.fileUploader.name).should('contain.text', fileName);
//   };
//
//   it('Shows summary of uploaded files correctly', () => {
//     const groupInputValue = 'Test input for group';
//
//     cy.get(`input[id="GroupPage-Input"]`).type(groupInputValue);
//
//     cy.get('div[data-testid="summary-group-component"]').within(() => {
//       cy.contains('span', groupInputValue).should('exist');
//     });
//   });
// });
//
// const appFrontend = new AppFrontend();

interface IUploadFileArgs {
  fileName: string;
}

// describe('File Upload Test', () => {
//   const makeTestFile = (fileName: string) => ({
//     fileName,
//     mimeType: 'application/pdf',
//     lastModified: Date.now(),
//     contents: Cypress.Buffer.from('hello world'),
//   });
//
//   const uploadFile = ({ fileName }: IUploadFileArgs) => {
//     cy.get(appFrontend.fileUploader.dropZoneContainer).should('be.visible');
//     cy.get(appFrontend.fileUploader.dropZone).selectFile(makeTestFile(fileName), { force: true });
//     cy.wait('@upload');
//     cy.get(appFrontend.fileUploader.status).should('contain.text', 'Finished uploading');
//     cy.get(appFrontend.fileUploader.name).should('contain.text', fileName);
//   };
//
//   beforeEach(() => {
//     cy.goto('upload');
//     cy.intercept('POST', '**/instances/**/data?dataType=*').as('upload');
//   });
//
//   it('Uploads a single file successfully', () => {
//     const fileName = 'testFile.pdf';
//     uploadFile({ fileName });
//     cy.window().then((win) => {
//       const attachments = win.CypressState?.attachments || {};
//       const uploadedFileNames = Object.values(attachments)
//         .flat()
//         .map((attachment) => attachment.data.filename);
//       expect(uploadedFileNames).to.include(fileName);
//     });
//   });
// });
