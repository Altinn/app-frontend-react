import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('readonly data models', () => {
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.multipleDatamodelsTest);
  });

  it('can show data models from previous tasks as read only', () => {
    cy.findByRole('textbox', { name: /tekstfelt 1/i }).type('første');
    cy.findByRole('textbox', { name: /tekstfelt 2/i }).type('andre');

    cy.gotoNavPage('Side2');
    cy.findAllByRole('checkbox').eq(2).click();
    cy.findAllByRole('checkbox').eq(3).click();
    cy.findAllByRole('checkbox').eq(4).click();

    cy.gotoNavPage('Side3');

    const today = new Date();
    const age1 = 36;
    const y1 = today.getFullYear() - age1;
    const m = today.getMonth().toString().padStart(2, '0');
    const d = today.getDate().toString().padStart(2, '0');
    const age2 = 25;
    const y2 = today.getFullYear() - age2;

    cy.findByRole('button', { name: /legg til ny/i }).click();
    cy.findByRole('textbox', { name: /fornavn/i }).type('Per');
    cy.findByRole('textbox', { name: /etternavn/i }).type('Hansen');
    cy.findByRole('textbox', { name: /fødselsdato/i }).type(`${d}${m}${y1}`);
    cy.findAllByRole('button', { name: /lagre og lukk/i })
      .first()
      .click();

    cy.findByRole('button', { name: /legg til ny/i }).click();
    cy.findByRole('textbox', { name: /fornavn/i }).type('Hanne');
    cy.findByRole('textbox', { name: /etternavn/i }).type('Persen');
    cy.findByRole('textbox', { name: /fødselsdato/i }).type(`${d}${m}${y2}`);
    cy.findAllByRole('button', { name: /lagre og lukk/i })
      .first()
      .click();

    cy.gotoNavPage('Side6');
    cy.findByRole('radio', { name: /kåre/i }).dsCheck();
    cy.get(appFrontend.errorReport).should('not.exist');
    cy.findByRole('button', { name: /send inn/i }).click();
    cy.findByRole('heading', { name: /fra forrige steg/i }).should('be.visible');

    cy.get(appFrontend.multipleDatamodelsTest.textField1Summary).should('contain.text', 'første');
    cy.get(appFrontend.multipleDatamodelsTest.textField2Summary).should('contain.text', 'andre');
    cy.get(appFrontend.multipleDatamodelsTest.sectorSummary).should('contain.text', 'Privat');
    cy.get(appFrontend.multipleDatamodelsTest.industrySummary).should(
      'contain.text',
      'Elektronikk og telekommunikasjon',
    );
    cy.get(appFrontend.multipleDatamodelsTest.industrySummary).should('contain.text', 'Forskning og utvikling');
    cy.get(appFrontend.multipleDatamodelsTest.industrySummary).should('contain.text', 'IKT (data/IT)');
    cy.get(appFrontend.multipleDatamodelsTest.personsSummary).should('contain.text', 'Fornavn : Per');
    cy.get(appFrontend.multipleDatamodelsTest.personsSummary).should('contain.text', 'Etternavn : Hansen');
    cy.get(appFrontend.multipleDatamodelsTest.personsSummary).should('contain.text', 'Alder : 36 år');
    cy.get(appFrontend.multipleDatamodelsTest.personsSummary).should('contain.text', 'Fornavn : Hanne');
    cy.get(appFrontend.multipleDatamodelsTest.personsSummary).should('contain.text', 'Etternavn : Persen');
    cy.get(appFrontend.multipleDatamodelsTest.personsSummary).should('contain.text', 'Alder : 25 år');
  });
});
