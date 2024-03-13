import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import { Likert } from 'test/e2e/pageobjects/likert';

const appFrontend = new AppFrontend();
const likertPage = new Likert();

describe('Likert', () => {
  it('Should show validation message for required likert', () => {
    cy.goto('likert');
    cy.get(appFrontend.sendinButton).click();

    const getAlerts = () => cy.findAllByRole('alert');
    getAlerts().should('have.length', 3);
    getAlerts().eq(0).should('contain.text', `Du må fylle ut ${likertPage.requiredQuestions[0].toLowerCase()}`);
    getAlerts().eq(1).should('contain.text', `Du må fylle ut ${likertPage.requiredQuestions[1].toLowerCase()}`);
    getAlerts().eq(2).should('contain.text', `Du må fylle ut ${likertPage.requiredQuestions[2].toLowerCase()}`);

    // Check the second required question and take a snapshot
    likertPage.selectRadio(likertPage.requiredQuestions[1], likertPage.options[1]);
    cy.findAllByRole('alert').should('have.length', 2);
    cy.snapshot('likert');
  });

  it('Should fill out optional likert and see results in summary component', () => {
    cy.goto('likert');
    likertPage.assertOptionalLikertColumnHeaders();
    likertPage.selectRadio(likertPage.optionalQuestions[0], likertPage.options[2]);
    likertPage.selectRadio(likertPage.optionalQuestions[1], likertPage.options[1]);
    likertPage.selectRadio(likertPage.optionalQuestions[2], likertPage.options[1]);

    const getSummary = () => cy.get('[data-testid=summary-summary1]');
    getSummary().should('contain.text', likertPage.optionalTableTitle);
    getSummary().should('contain.text', `${likertPage.optionalQuestions[0]} : ${likertPage.options[2]}`);
    getSummary().should('contain.text', `${likertPage.optionalQuestions[1]} : ${likertPage.options[1]}`);
    getSummary().should('contain.text', `${likertPage.optionalQuestions[2]} : ${likertPage.options[1]}`);

    cy.get('body').focus();
    getSummary().find('button').click();

    // The first input always gets focus, but that input should be in the first row of optional questions
    cy.focused().closest('tr').should('contain.text', likertPage.optionalQuestions[0]);
  });
});
