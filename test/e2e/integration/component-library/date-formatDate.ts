import { AppFrontend } from 'test/e2e/pageobjects/app-frontend';

const appFrontend = new AppFrontend();

const Rows = {
  Raw: { type: 'Text', backend: false, raw: true },
  Date: { type: 'Date', backend: false, raw: false },
  FormatDate: { type: 'TextFormat', backend: false, raw: false },
  FormatDateBackend: { type: 'TextFormat', backend: true, raw: false },
  DatePicker: { type: 'DatePicker', backend: false, raw: false },
};

const Cols = {
  String: { type: 'String' },
  DateTime: { type: 'DateTime' },
  DateOnly: { type: 'DateOnly' },
};

type Row = (typeof Rows)[keyof typeof Rows];
type Col = (typeof Cols)[keyof typeof Cols];

function id(row: Row, col: Col) {
  const baseId = `dates-${row.type}-${col.type}`;
  if (row.backend) {
    return `${baseId}-Backend`;
  }
  return baseId;
}

const newYork = 'America/New_York' as const;
const tzOslo = 'Europe/Oslo' as const;
const tzUtc = 'UTC' as const;
const browserTimezones = [newYork, tzOslo] as const;
type validTimezones = (typeof browserTimezones)[number] | typeof tzUtc;
type TZ = { browser: (typeof browserTimezones)[number]; backend: validTimezones };

describe('Date component and formatDate expression', () => {
  Cypress.on('test:before:run', (test) => {
    const timezoneId = test.title.replace('Should work in ', '');
    Cypress.automation('remote:debugger:protocol', {
      command: 'Emulation.setTimezoneOverride',
      params: { timezoneId },
    });
  });
  Cypress.on('test:after:run', () => {
    Cypress.automation('remote:debugger:protocol', {
      command: 'Emulation.setTimezoneOverride',
      params: { timezoneId: '' }, // Reset to default
    });
  });

  browserTimezones.forEach((tz) => {
    it(`Should work in ${tz}`, () => {
      cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
      cy.gotoNavPage('DateAndFormatDate');

      const timezone: TZ = {
        browser: tz,
        backend: Cypress.env('type') === 'localtest' ? tzOslo : tzUtc,
      };

      testEmpty();
      testLeapYearDay();
      testCloseTo2022();
      midnightOtherTz(timezone);
      midnightUtc(timezone);
    });
  });
});

/**
 * When we load the page, the date/time will be null, and form-content should be empty
 */
function testEmpty() {
  for (const row of Object.values(Rows)) {
    if (row.type !== 'DatePicker') {
      for (const col of Object.values(Cols)) {
        cy.get(`#form-content-${id(row, col)}`).should('have.text', '');
      }
    }
  }
  for (const col of Object.values(Cols)) {
    cy.get(`#${id(Rows.DatePicker, col)}`).should('have.value', '');
  }
}

/**
 * This works the same in all timezones, as the raw timestamp has no timezone info, so it's assumed to be
 * in the local timezone of the browser (and on backend). Thus input === output.
 */
function testLeapYearDay() {
  cy.dsSelect('#datesDate', 'Skuddårsdagen 2020');

  const rawString = '2020-02-29 12:00:00';
  const rawDateTime = '2020-02-29T12:00:00';
  const rawDateOnly = '2020-02-29T00:00:00';

  const local = '29.02.2020 12:00:00';
  const zeroed = '29.02.2020 00:00:00';
  const inDatepicker = '29.02.2020';

  cy.get(`#form-content-${id(Rows.Raw, Cols.String)}`).should('have.text', rawString);
  cy.get(`#form-content-${id(Rows.Raw, Cols.DateTime)}`).should('have.text', rawDateTime);
  cy.get(`#form-content-${id(Rows.Raw, Cols.DateOnly)}`).should('have.text', rawDateOnly);
  cy.get(`#form-content-${id(Rows.Date, Cols.String)}`).should('have.text', local);
  cy.get(`#form-content-${id(Rows.Date, Cols.DateTime)}`).should('have.text', local);
  cy.get(`#form-content-${id(Rows.Date, Cols.DateOnly)}`).should('have.text', zeroed);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.String)}`).should('have.text', local);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.DateTime)}`).should('have.text', local);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.DateOnly)}`).should('have.text', zeroed);
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.String)}`).should('have.text', local);
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.DateTime)}`).should('have.text', local);
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.DateOnly)}`).should('have.text', zeroed);
  cy.get(`#${id(Rows.DatePicker, Cols.String)}`).should('have.value', inDatepicker);
  cy.get(`#${id(Rows.DatePicker, Cols.DateTime)}`).should('have.value', inDatepicker);
  cy.get(`#${id(Rows.DatePicker, Cols.DateOnly)}`).should('have.value', inDatepicker);
}

/**
 * This demonstrates a bug that affects the date parsing in the frontend, but not the backend.
 */
function testCloseTo2022() {
  cy.dsSelect('#datesDate', 'Veldig tett på 2022');

  const rawString = '2021-12-31 23:59:59.9999999';
  const rawDateTime = '2021-12-31T23:59:59.9999999';
  const rawDateOnly = '2021-12-31T00:00:00';

  const local = '31.12.2021 23:59:59';
  const zeroed = '31.12.2021 00:00:00';
  const inDatepicker = '31.12.2021';

  const buggy = '01.01.2022 00:00:00'; /** @see exprParseDate */
  const buggyDatepicker = '01.01.2022';

  cy.get(`#form-content-${id(Rows.Raw, Cols.String)}`).should('have.text', rawString);
  cy.get(`#form-content-${id(Rows.Raw, Cols.DateTime)}`).should('have.text', rawDateTime);
  cy.get(`#form-content-${id(Rows.Raw, Cols.DateOnly)}`).should('have.text', rawDateOnly);
  cy.get(`#form-content-${id(Rows.Date, Cols.String)}`).should('have.text', buggy);
  cy.get(`#form-content-${id(Rows.Date, Cols.DateTime)}`).should('have.text', buggy);
  cy.get(`#form-content-${id(Rows.Date, Cols.DateOnly)}`).should('have.text', zeroed);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.String)}`).should('have.text', buggy);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.DateTime)}`).should('have.text', buggy);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.DateOnly)}`).should('have.text', zeroed);
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.String)}`).should('have.text', local);
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.DateTime)}`).should('have.text', local);
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.DateOnly)}`).should('have.text', zeroed);
  cy.get(`#${id(Rows.DatePicker, Cols.String)}`).should('have.value', buggyDatepicker);
  cy.get(`#${id(Rows.DatePicker, Cols.DateTime)}`).should('have.value', buggyDatepicker);
  cy.get(`#${id(Rows.DatePicker, Cols.DateOnly)}`).should('have.value', inDatepicker);
}

/**
 * At this point the browser timezone starts to matter, because the date/time has specified a timezone. Thus
 * it needs to be converted to the local timezone before being displayed.
 */
function midnightOtherTz(tz: TZ) {
  cy.dsSelect('#datesDate', 'Midnatt i en annen tidssone');

  const rawString = '2020-05-17 00:00:00-08:00';
  const rawDateTime = '2020-05-17T10:00:00+02:00';
  const rawDateOnly = '2020-05-17T00:00:00+02:00';

  // Backend local time is Europe/Oslo, so the date will be converted to that timezone
  const inOslo = '17.05.2020 10:00:00';
  const inOsloZeroed = '17.05.2020 00:00:00';
  const date = '17.05.2020';
  const dateZeroed = tz.browser === newYork ? '16.05.2020' : '17.05.2020';
  const dependsOnTimezone = tz.browser === newYork ? '17.05.2020 04:00:00' : inOslo;
  const dependsOnTimezoneZeroed = tz.browser === newYork ? '16.05.2020 18:00:00' : inOsloZeroed;

  cy.get(`#form-content-${id(Rows.Raw, Cols.String)}`).should('have.text', rawString);
  cy.get(`#form-content-${id(Rows.Raw, Cols.DateTime)}`).should('have.text', rawDateTime);
  cy.get(`#form-content-${id(Rows.Raw, Cols.DateOnly)}`).should('have.text', rawDateOnly);
  cy.get(`#form-content-${id(Rows.Date, Cols.String)}`).should('have.text', dependsOnTimezone);
  cy.get(`#form-content-${id(Rows.Date, Cols.DateTime)}`).should('have.text', dependsOnTimezone);
  cy.get(`#form-content-${id(Rows.Date, Cols.DateOnly)}`).should('have.text', dependsOnTimezoneZeroed);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.String)}`).should('have.text', dependsOnTimezone);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.DateTime)}`).should('have.text', dependsOnTimezone);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.DateOnly)}`).should('have.text', dependsOnTimezoneZeroed);
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.String)}`).should('have.text', inOslo); // Backend local time
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.DateTime)}`).should('have.text', inOslo);
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.DateOnly)}`).should('have.text', inOsloZeroed);
  cy.get(`#${id(Rows.DatePicker, Cols.String)}`).should('have.value', date);
  cy.get(`#${id(Rows.DatePicker, Cols.DateTime)}`).should('have.value', date);
  cy.get(`#${id(Rows.DatePicker, Cols.DateOnly)}`).should('have.value', dateZeroed);
}

function midnightUtc(tz: TZ) {
  cy.dsSelect('#datesDate', 'Midnatt i UTC');

  const rawString = '2020-05-17T00:00:00Z';
  const rawDateTime = '2020-05-17T02:00:00+02:00';
  const rawDateOnly = '2020-05-17T00:00:00+02:00';

  const utcInOslo = '17.05.2020 02:00:00';
  const utcInOsloZeroed = '17.05.2020 00:00:00';
  const utcInBrowser = tz.browser === newYork ? '16.05.2020 20:00:00' : utcInOslo;
  const utcInBrowserZeroed = tz.browser === newYork ? '16.05.2020 18:00:00' : utcInOsloZeroed;
  const dateInUtc = tz.browser === newYork ? '16.05.2020' : '17.05.2020';

  cy.get(`#form-content-${id(Rows.Raw, Cols.String)}`).should('have.text', rawString);
  cy.get(`#form-content-${id(Rows.Raw, Cols.DateTime)}`).should('have.text', rawDateTime);
  cy.get(`#form-content-${id(Rows.Raw, Cols.DateOnly)}`).should('have.text', rawDateOnly);
  cy.get(`#form-content-${id(Rows.Date, Cols.String)}`).should('have.text', utcInBrowser);
  cy.get(`#form-content-${id(Rows.Date, Cols.DateTime)}`).should('have.text', utcInBrowser);
  cy.get(`#form-content-${id(Rows.Date, Cols.DateOnly)}`).should('have.text', utcInBrowserZeroed);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.String)}`).should('have.text', utcInBrowser);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.DateTime)}`).should('have.text', utcInBrowser);
  cy.get(`#form-content-${id(Rows.FormatDate, Cols.DateOnly)}`).should('have.text', utcInBrowserZeroed);
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.String)}`).should('have.text', utcInOslo);
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.DateTime)}`).should('have.text', utcInOslo);
  cy.get(`#form-content-${id(Rows.FormatDateBackend, Cols.DateOnly)}`).should('have.text', utcInOsloZeroed);
  cy.get(`#${id(Rows.DatePicker, Cols.String)}`).should('have.value', dateInUtc);
  cy.get(`#${id(Rows.DatePicker, Cols.DateTime)}`).should('have.value', dateInUtc);
  cy.get(`#${id(Rows.DatePicker, Cols.DateOnly)}`).should('have.value', dateInUtc);
}
