export const makeTestFile = (fileName: string) => ({
  fileName,
  mimeType: 'image/jpg',
  lastModified: Date.now(),
  contents: 'test/e2e/fixtures/map-tile.png',
});

export const uploadImageAndVerify = (fileName: string) => {
  cy.get('[data-componentId="ImageUploadPage-ImageUpload"]').should('be.visible');

  cy.get('[data-componentId="ImageUploadPage-ImageUpload"]')
    .find('input[type="file"]')
    .selectFile(makeTestFile(fileName), { force: true });

  cy.get('canvas').should('be.visible');
  cy.get('canvas').then(($canvas) => {
    const canvas = $canvas[0] as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const data = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
    // Count non-transparent pixels
    const hasImage =
      data &&
      Array.from(data).some(
        (value, index) => index % 4 !== 3 && value !== 0, // not alpha channel, and not 0
      );
    expect(hasImage).to.be.true;
  });
};
