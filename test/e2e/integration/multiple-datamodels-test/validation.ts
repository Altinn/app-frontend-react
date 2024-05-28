import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

describe('validating multiple data models', () => {
  beforeEach(() => {
    cy.startAppInstance(appFrontend.apps.multipleDatamodelsTest);
  });

  it('shows validations for multiple data models', () => {
    cy.waitForLoad();

    cy.get(appFrontend.errorReport).should('not.exist');
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField1)).should('not.exist');
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField2)).should('not.exist');

    cy.findByRole('textbox', { name: /tekstfelt 1/i }).type('Dette er en litt for lang tekst');
    cy.findByRole('textbox', { name: /tekstfelt 2/i }).type('Dette er en annen veldig lang tekst');
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField1)).should(
      'contain.text',
      'Bruk 10 eller færre tegn',
    );
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField2)).should(
      'contain.text',
      'Bruk 10 eller færre tegn',
    );
    cy.get(appFrontend.errorReport).findAllByRole('listitem').should('have.length', 2);

    cy.findByRole('textbox', { name: /tekstfelt 1/i }).clear();
    cy.findByRole('textbox', { name: /tekstfelt 2/i }).clear();

    cy.get(appFrontend.errorReport).should('not.exist');

    cy.findByRole('textbox', { name: /postnr/i }).type('0000');
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.addressField)).should(
      'contain.text',
      'Postnummer er ugyldig',
    );
    cy.get(appFrontend.errorReport).findAllByRole('listitem').should('have.length', 1);
    cy.findByRole('textbox', { name: /postnr/i }).clear();
    cy.get(appFrontend.errorReport).should('not.exist');

    cy.gotoNavPage('Side6');
    cy.findByRole('button', { name: /send inn/i }).click();
    cy.get(appFrontend.errorReport).findAllByRole('listitem').should('have.length', 4);

    cy.gotoNavPage('Side1');
    cy.findByRole('textbox', { name: /tekstfelt 1/i }).type('Tekst');
    cy.findByRole('textbox', { name: /tekstfelt 2/i }).type('Tekst');
    cy.gotoNavPage('Side3');
    cy.findByRole('button', { name: /legg til ny/i }).click();
    cy.gotoNavPage('Side6');
    cy.findByRole('radio', { name: /kåre/i }).dsCheck();
    cy.get(appFrontend.errorReport).should('not.exist');
    cy.findByRole('button', { name: /send inn/i }).click();
    cy.findByRole('heading', { name: /fra forrige steg/i }).should('be.visible');
  });

  it('expression validation for multiple datamodels', () => {
    cy.waitForLoad();

    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField1)).should('not.exist');
    cy.findByRole('textbox', { name: /tekstfelt 1/i }).type('feil');
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField1)).should(
      'contain.text',
      'Feil er feil',
    );
    cy.get(appFrontend.errorReport).findAllByRole('listitem').should('have.length', 1);
    cy.findByRole('textbox', { name: /tekstfelt 1/i }).clear();

    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField2)).should('not.exist');
    cy.findByRole('textbox', { name: /tekstfelt 2/i }).type('feil');
    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.textField2)).should(
      'contain.text',
      'Feil er advarsel',
    );
    cy.get(appFrontend.errorReport).should('not.exist');
    cy.findByRole('textbox', { name: /tekstfelt 2/i }).clear();

    cy.gotoNavPage('Side2');
    cy.findAllByRole('checkbox').eq(0).click();
    cy.findAllByRole('checkbox').eq(1).click();
    cy.findAllByRole('checkbox').eq(2).click();
    cy.findAllByRole('checkbox').eq(3).click();
    cy.findAllByRole('checkbox').eq(4).click();
    cy.findAllByRole('checkbox').eq(5).click();
    cy.findAllByRole('checkbox').eq(7).click();
    cy.findAllByRole('checkbox').eq(8).click();

    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.chooseIndusty)).should(
      'contain.text',
      'Du kan ikke velge både IKT og Verkstedindustri',
    );
    cy.get(appFrontend.errorReport).findAllByRole('listitem').should('have.length', 1);

    cy.findByRole('checkbox', { name: /verkstedindustri/i }).click();

    cy.get(appFrontend.fieldValidation(appFrontend.multipleDatamodelsTest.chooseIndusty)).should('not.exist');
    cy.get(appFrontend.errorReport).should('not.exist');

    cy.gotoNavPage('Side3');
    cy.findByRole('button', { name: /legg til ny/i }).click();
    cy.findByRole('textbox', { name: /etternavn/i }).type('Helt Konge!');

    cy.get(appFrontend.fieldValidation('person-etternavn-0')).should(
      'contain.text',
      'Etternavn kan ikke inneholde utropstegn!!!',
    );
    cy.get(appFrontend.errorReport).findAllByRole('listitem').should('have.length', 1);

    cy.findAllByRole('button', { name: /slett/i }).first().click();

    cy.get(appFrontend.errorReport).should('not.exist');
  });
});
