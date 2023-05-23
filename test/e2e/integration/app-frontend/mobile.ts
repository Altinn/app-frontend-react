import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';
import { Datalist } from 'test/e2e/pageobjects/datalist';
import { Likert } from 'test/e2e/pageobjects/likert';

const appFrontend = new AppFrontend();
const likertPage = new Likert();
const dataListPage = new Datalist();

describe('Mobile', () => {
  beforeEach(() => {
    cy.viewport('samsung-s10');
  });

  it('is possible to submit app instance from mobile', () => {
    testChangeName();
    testGroup();
    testLikert();
    testList();
    testConfirm();
  });
});

function testChangeName() {
  cy.goto('changename');
  cy.get(appFrontend.changeOfName.oldFullName).parents().eq(2).should('have.css', 'max-width', '100%');
  cy.gotoAndComplete('changename');
  cy.intercept('**/api/layoutsettings/group').as('getLayoutGroup');
  cy.get(appFrontend.sendinButton).should('be.visible');
  cy.sendIn();
}

function testGroup() {
  cy.wait('@getLayoutGroup');
  cy.navPage('repeating').click();
  cy.get(appFrontend.group.showGroupToContinue).find('input').dsCheck();
  cy.addItemToGroup(1, 2, 'automation');
  cy.navPage('hide').click();
  cy.get(appFrontend.group.sendersName).type('automation');
  cy.get(appFrontend.navMenu).should('not.exist');
  cy.get(appFrontend.group.navigationBarButton).should('have.attr', 'aria-expanded', 'false').click();
  cy.get(appFrontend.group.navigationBarButton).should('have.attr', 'aria-expanded', 'true');
  cy.get(appFrontend.navMenu).should('be.visible');
  cy.get(appFrontend.navMenu).find('li > button').last().click();
  cy.get(appFrontend.navMenu).should('not.exist');
  cy.sendIn();
}

function testLikert() {
  likertPage.selectRequiredRadiosInMobile();
  cy.sendIn();
}

function testList() {
  cy.get(dataListPage.tableBody).contains('Caroline').parent('div').parent('td').parent('tr').click();
  cy.get(appFrontend.nextButton).click();
  cy.sendIn();
}

function testConfirm() {
  cy.get(appFrontend.confirm.sendIn).click();
  cy.get(appFrontend.confirm.sendIn).should('not.exist');
  cy.get(appFrontend.receipt.container).should('be.visible');
  cy.get(appFrontend.receipt.linkToArchive).should('be.visible');
}
