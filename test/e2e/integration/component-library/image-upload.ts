import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import { uploadImageAndVerify } from 'test/e2e/support/apps/component-library/uploadImageAndVerify';

const appFrontend = new AppFrontend();

const fileName1 = 'uploadThis1.png';

describe('ImageUpload component', () => {
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.componentLibrary);
  });

  it('is able to upload image correctly', () => {
    cy.gotoNavPage('Bildeopplasting');

    uploadImageAndVerify(fileName1);
  });

  it('is able to cancel the cropping process', () => {
    cy.gotoNavPage('Bildeopplasting');

    uploadImageAndVerify(fileName1);

    cy.findByRole('button', { name: /Avbryt/i }).click();
    cy.get('canvas').should('not.exist');
    cy.get('[data-componentId="ImageUploadPage-ImageUpload"]').should('be.visible');
  });

  it('is able to upload, crop and save', () => {
    cy.gotoNavPage('Bildeopplasting');

    uploadImageAndVerify(fileName1);

    cy.findByRole('button', { name: /Lagre/i }).click();
    cy.get('canvas').should('not.exist');
    cy.findByRole('img', { name: /uploadThis1.jpg/ }).should('be.visible');
  });

  it('is able to delete a saved image', () => {
    cy.gotoNavPage('Bildeopplasting');

    uploadImageAndVerify(fileName1);

    cy.findByRole('button', { name: /Lagre/i }).click();
    cy.get('canvas').should('not.exist');
    cy.get('img').should('be.visible');
    cy.findByRole('button', { name: /Slett bildet/i }).click();
    cy.findByRole('img', { name: /uploadThis1.jpg/ }).should('not.exist');
    cy.get('canvas').should('not.exist');
    cy.get('[data-componentId="ImageUploadPage-ImageUpload"]').should('be.visible');
  });
});
