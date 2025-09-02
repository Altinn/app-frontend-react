import type { RouteHandler } from 'cypress/types/net-stubbing';

import { reverseName } from 'test/e2e/support/utils';

import type { IncomingApplicationMetadata } from 'src/features/applicationMetadata/types';
import type { IProcess, ITask } from 'src/types/shared';

export type CyUser = 'default' | 'manager' | 'accountant' | 'auditor' | 'selfIdentified';

type UserInfo = {
  displayName: string;
  userName: string;
  userPassword: string;
  localPartyId: string;
};

export const cyUserCredentials: { [K in CyUser]: UserInfo } = {
  default: {
    displayName: Cypress.env('defaultFullName'),
    userName: Cypress.env('defaultUserName'),
    userPassword: Cypress.env('defaultUserPwd'),
    localPartyId: Cypress.env('defaultPartyId'),
  },
  manager: {
    displayName: Cypress.env('managerFullName'),
    userName: Cypress.env('managerUserName'),
    userPassword: Cypress.env('managerUserPwd'),
    localPartyId: Cypress.env('managerPartyId'),
  },
  accountant: {
    displayName: Cypress.env('accountantFullName'),
    userName: Cypress.env('accountantUserName'),
    userPassword: Cypress.env('accountantUserPwd'),
    localPartyId: Cypress.env('accountantPartyId'),
  },
  auditor: {
    displayName: Cypress.env('auditorFullName'),
    userName: Cypress.env('auditorUserName'),
    userPassword: Cypress.env('auditorUserPwd'),
    localPartyId: Cypress.env('auditorPartyId'),
  },
  selfIdentified: {
    displayName: Cypress.env('selfIdentifiedFullName'),
    userName: Cypress.env('selfIdentifiedUserName'),
    userPassword: Cypress.env('selfIdentifiedUserPwd'),
    localPartyId: Cypress.env('selfIdentifiedPartyId'),
  },
};

export const getDisplayName = (user: CyUser) => cyUserCredentials[user].displayName;
export const getLocalPartyId = (user: CyUser) => cyUserCredentials[user].localPartyId;

Cypress.Commands.add('assertUser', (user: CyUser) => {
  cy.get('[data-testid=AppHeader]').should('contain.text', getDisplayName(user));
});

type MinimalTask = Pick<ITask, 'read' | 'write' | 'actions'>;
function getPermissions(format: string): MinimalTask {
  const permissions: MinimalTask = {
    read: false,
    write: false,
    actions: {},
  };
  for (const i of format) {
    switch (i) {
      case 'r':
        permissions.read = true;
        break;
      case 'w':
        permissions.write = true;
        break;
      case 'i':
        permissions.actions = { ...permissions.actions, instantiate: true };
        break;
      case 'c':
        permissions.actions = { ...permissions.actions, confirm: true };
        break;
      case 's':
        permissions.actions = { ...permissions.actions, sign: true };
        break;
      case 'j':
        permissions.actions = { ...permissions.actions, reject: true };
        break;
    }
  }
  return permissions;
}

Cypress.Commands.add('setPermissions', (permissionFormat: string) => {
  Cypress.env('authPermissions', permissionFormat);
});

Cypress.Commands.add('interceptPermissions', () => {
  const interceptor: RouteHandler = (req) => {
    const permissionFormat = Cypress.env('authPermissions') ?? '';
    const permissions = getPermissions(permissionFormat);
    req.on('response', (res) => {
      const body = res.body as IProcess;
      if (body.currentTask) {
        body.currentTask.read = permissions.read;
        body.currentTask.write = permissions.write;
        body.currentTask.actions = permissions.actions;
      }
    });
  };
  cy.intercept({ method: 'GET', url: '**/process' }, interceptor).as('getProcess');
  cy.intercept({ method: 'PUT', url: '**/process/next*' }, interceptor).as('processNext');
});

type CyUserLoginParams = {
  cyUser: CyUser;
  authenticationLevel: string;
};

export function cyUserLogin({ cyUser, authenticationLevel }: CyUserLoginParams) {
  cy.log(`Logging in as user: ${cyUser}`);
  const user = cyUserCredentials[cyUser];

  if (Cypress.env('type') === 'localtest') {
    localLogin({ partyId: user.localPartyId, authenticationLevel });
    return;
  }

  const { userName, userPassword } = user;
  if (userName === cyUserCredentials.selfIdentified.userName) {
    loginSelfIdentifiedTt02Login(userName, userPassword);
  } else {
    cyUserTt02Login(userName, userPassword);
  }
}

type LocalLoginParams =
  | {
      partyId: string;
      authenticationLevel: string;
    }
  | {
      displayName: string;
      authenticationLevel: string;
    };

function localLogin({ authenticationLevel, ...rest }: LocalLoginParams) {
  cy.visit(`${Cypress.config('baseUrl')}`);

  if ('partyId' in rest) {
    const partyId = rest.partyId;
    cy.log(`Logging in as local user: ${partyId} with authentication level: ${authenticationLevel}`);
    cy.get('select#UserSelect').select(partyId);
    cy.get('select#UserSelect').should('have.value', partyId);
  } else if ('displayName' in rest) {
    const displayName = rest.displayName;
    cy.log(`Logging in as local user: ${displayName} with authentication level: ${authenticationLevel}`);
    cy.findByRole('combobox', { name: /select test users/i })
      .find('option')
      .contains(new RegExp(displayName, 'i'))
      .then(($option) => {
        cy.get('select#UserSelect').select($option.val() as string);
        cy.get('select#UserSelect').should('have.value', $option.val() as string);
      });
  }

  cy.findByRole('combobox', { name: /authentication level/i })
    .should('exist')
    .find('option')
    .contains(new RegExp(authenticationLevel, 'i'))
    .then(($option) => {
      cy.get('select#AuthenticationLevel').select($option.val() as string);
      cy.get('select#AuthenticationLevel').should('have.value', $option.val() as string);
    });

  // By clicking 'Proceed to app' we would be opening the app. Let's do that later with a cy.visit() instead, so
  // we can control it better. We also have cases where we want to load a specific/existing instance as another user.
  refreshAuthWithoutPageLoad();
}

function loginSelfIdentifiedTt02Login(user: string, pwd: string) {
  const loginUrl = 'https://tt02.altinn.no/ui/Authentication/SelfIdentified';
  cy.intercept('POST', loginUrl).as('login');
  cy.visit(loginUrl);
  cy.findByRole('textbox', { name: /Brukernavn/i }).type(user);
  cy.get('input[type=password]').type(pwd);
  cy.findByRole('button', { name: /Logg inn/i }).click();
}

function cyUserTt02Login(user: string, pwd: string) {
  cy.request({
    method: 'POST',
    url: `${Cypress.config('baseUrl')}/api/authentication/authenticatewithpassword`,
    headers: {
      'Content-Type': 'application/hal+json',
    },
    body: JSON.stringify({
      UserName: user,
      UserPassword: pwd,
    }),
  }).as('login');
  waitForLogin();
}

function waitForLogin() {
  cy.get('@login').should((response) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = response as unknown as Cypress.Response<any>;
    expect(r.status).to.eq(200);
  });
}

/************************
 *
 * TENOR AUTHENTICATION
 *
 * You can find these users and organizations at: https://testdata.skatteetaten.no/
 * If using these for an app, you must add the users and organizations to the
 * wwwroot/testData.json file for that specific app.
 *
 ************************/

export type TenorOrg = {
  name: string;
  orgNr: string;
};

export type TenorUser = {
  name: string;
  ssn: string;
  role?: string;
  orgs?: string[];
};

type TenorLoginParams = {
  appName: string;
  tenorUser: TenorUser;
  authenticationLevel: string;
};

export function tenorUserLogin({ appName, tenorUser, authenticationLevel }: TenorLoginParams) {
  cy.log(`Logging in as Tenor user: ${tenorUser.name}`);
  cy.intercept<object, IncomingApplicationMetadata>('**/api/v1/applicationmetadata', (req) => {
    req.reply((res) => {
      const body = res.body as IncomingApplicationMetadata;

      res.headers['cache-control'] = 'no-store';
      body.promptForParty = 'never';
    });
  });

  if (Cypress.env('type') === 'localtest') {
    localLogin({ displayName: tenorUser.name, authenticationLevel });
  } else {
    tenorTt02Login(appName, tenorUser);
    cy.reloadAndWait();
  }
}

function tenorTt02Login(appName: string, user: TenorUser) {
  cy.clearCookies();
  cy.visit(`https://ttd.apps.${Cypress.config('baseUrl')?.slice(8)}/ttd/${appName}`);

  cy.findByRole('link', {
    name: /testid lag din egen testbruker/i,
  }).click();

  cy.findByRole('textbox', {
    name: /personidentifikator \(syntetisk\)/i,
  }).type(user.ssn);

  cy.findByRole('button', {
    name: /autentiser/i,
  }).click();

  cy.findByText(new RegExp(reverseName(user.name), 'i')).click();
  cy.waitForLoad();
}

/**
 * Once a top-level navigation begins (native form submit counts), Cypress flips into “—waiting for new page to load—”
 * and there’s no built-in switch to skip that wait—even if the server returns 204.
 * @see https://github.com/cypress-io/cypress/issues/8619
 *
 * A reliable workaround is to retarget the form to a hidden iframe just for this click. The POST still happens, but the
 * top window doesn’t navigate—so Cypress never enters the page-load wait.
 */
function refreshAuthWithoutPageLoad() {
  cy.document().then((doc) => {
    if (!doc.querySelector('iframe[name="cypress-sink"]')) {
      const iframe = doc.createElement('iframe');
      iframe.name = 'cypress-sink';
      iframe.style.display = 'none';
      doc.body.appendChild(iframe);
    }
  });

  cy.findByRole('button', { name: 'Refresh authentication' })
    .closest('form')
    .then(($form) => {
      $form.attr('target', 'cypress-sink');
    });

  cy.intercept({ method: 'POST', url: '/Home/LogInTestUser', times: 1 }).as('login');
  cy.findByRole('button', { name: 'Refresh authentication' }).click();
  cy.wait('@login').its('response.statusCode').should('eq', 204);
}
