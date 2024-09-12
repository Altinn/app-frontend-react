import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import { Likert } from 'test/e2e/pageobjects/likert';

const appFrontend = new AppFrontend();
const likertPage = new Likert();

describe('Likert', () => {
  it('Should show validation message for required likert', () => {
    cy.goto('likert');
    cy.get(appFrontend.sendinButton).click();

    cy.get(appFrontend.fieldValidation('likert-group-required-item-3')).should(
      'contain.text',
      `Du må fylle ut ${likertPage.requiredQuestions[0]}`,
    );
    cy.get(appFrontend.fieldValidation('likert-group-required-item-4')).should(
      'contain.text',
      `Du må fylle ut ${likertPage.requiredQuestions[1]}`,
    );
    cy.get(appFrontend.fieldValidation('likert-group-required-item-5')).should(
      'contain.text',
      `Du må fylle ut ${likertPage.requiredQuestions[2]}`,
    );

    // Check the second required question and take a snapshot
    likertPage.selectRadio(likertPage.requiredQuestions[1], likertPage.options[1]);
    cy.get(appFrontend.fieldValidation('likert-group-required-item-4')).should(
      'not.contain.text',
      `Du må fylle ut ${likertPage.requiredQuestions[1]}`,
    );
    cy.snapshot('likert');
  });
  it('Should fill out optional likert and see results in summary component', () => {
    cy.goto('likert');
    cy.findByRole('table', { name: likertPage.optionalTableTitle }).within(() => {
      cy.findByText('Spørsmål');
    });
    likertPage.selectRadio(likertPage.optionalQuestions[0], likertPage.options[2]);
    likertPage.selectRadio(likertPage.optionalQuestions[1], likertPage.options[1]);
    likertPage.selectRadio(likertPage.optionalQuestions[2], likertPage.options[1]);
    cy.get('[data-testid=summary-summary1]').should(($summary) => {
      const text = $summary.text();
      expect(text).to.contain(likertPage.optionalTableTitle);
      expect(text).to.contain(`${likertPage.optionalQuestions[0]} : ${likertPage.options[2]}`);
      expect(text).to.contain(`${likertPage.optionalQuestions[1]} : ${likertPage.options[1]}`);
      expect(text).to.contain(`${likertPage.optionalQuestions[2]} : ${likertPage.options[1]}`);
    });
  });
});
