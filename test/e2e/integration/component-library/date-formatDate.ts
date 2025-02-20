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

function textContent(row: Row, col: Col) {
  return cy.get(`#form-content-${id(row, col)}`);
}

function datePickerContent(row: Row, col: Col) {
  return cy.get(`#${id(row, col)}`);
}

const newYork = 'America/New_York';
const tzOslo = 'Europe/Oslo';
const timeZones = [newYork, tzOslo];

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

  timeZones.forEach((tz) => {
    it(`Should work in ${tz}`, () => {
      cy.startAppInstance(appFrontend.apps.componentLibrary, { authenticationLevel: '2' });
      cy.gotoNavPage('DateAndFormatDate');

      // When we load the page, the date/time will be null, and form-content should be empty
      for (const row of Object.values(Rows)) {
        if (row.type !== 'DatePicker') {
          for (const col of Object.values(Cols)) {
            textContent(row, col).should('have.text', '');
          }
        }
      }
      for (const col of Object.values(Cols)) {
        datePickerContent(Rows.DatePicker, col).should('have.value', '');
      }

      // This works the same in all timezones, as the raw timestamp has no timezone info, so it's assumed to be
      // in the local timezone of the browser (and on backend). Thus input === output.
      cy.dsSelect('#datesDate', 'Skuddårsdagen 2020');
      textContent(Rows.Raw, Cols.String).should('have.text', '2020-02-29 12:00:00');
      textContent(Rows.Raw, Cols.DateTime).should('have.text', '2020-02-29T12:00:00');
      textContent(Rows.Raw, Cols.DateOnly).should('have.text', '2020-02-29T00:00:00');
      const leapYearDay = '29.02.2020 12:00:00';
      const leapYearDayZeroed = '29.02.2020 00:00:00';
      textContent(Rows.Date, Cols.String).should('have.text', leapYearDay);
      textContent(Rows.Date, Cols.DateTime).should('have.text', leapYearDay);
      textContent(Rows.Date, Cols.DateOnly).should('have.text', leapYearDayZeroed);
      textContent(Rows.FormatDate, Cols.String).should('have.text', leapYearDay);
      textContent(Rows.FormatDate, Cols.DateTime).should('have.text', leapYearDay);
      textContent(Rows.FormatDate, Cols.DateOnly).should('have.text', leapYearDayZeroed);
      textContent(Rows.FormatDateBackend, Cols.String).should('have.text', leapYearDay);
      textContent(Rows.FormatDateBackend, Cols.DateTime).should('have.text', leapYearDay);
      textContent(Rows.FormatDateBackend, Cols.DateOnly).should('have.text', leapYearDayZeroed);
      datePickerContent(Rows.DatePicker, Cols.String).should('have.value', '29.02.2020');
      datePickerContent(Rows.DatePicker, Cols.DateTime).should('have.value', '29.02.2020');
      datePickerContent(Rows.DatePicker, Cols.DateOnly).should('have.value', '29.02.2020');

      // This demonstrates a bug that affects the date parsing in the frontend, but not the backend.
      cy.dsSelect('#datesDate', 'Veldig tett på 2022');
      textContent(Rows.Raw, Cols.String).should('have.text', '2021-12-31 23:59:59.9999999');
      textContent(Rows.Raw, Cols.DateTime).should('have.text', '2021-12-31T23:59:59.9999999');
      textContent(Rows.Raw, Cols.DateOnly).should('have.text', '2021-12-31T00:00:00');
      const newYearsEve = '31.12.2021 23:59:59';
      const newYearsEveZeroed = '31.12.2021 00:00:00';
      const newYearsEveFail = '01.01.2022 00:00:00'; /** @see exprParseDate */
      textContent(Rows.Date, Cols.String).should('have.text', newYearsEveFail);
      textContent(Rows.Date, Cols.DateTime).should('have.text', newYearsEveFail);
      textContent(Rows.Date, Cols.DateOnly).should('have.text', newYearsEveZeroed);
      textContent(Rows.FormatDate, Cols.String).should('have.text', newYearsEveFail);
      textContent(Rows.FormatDate, Cols.DateTime).should('have.text', newYearsEveFail);
      textContent(Rows.FormatDate, Cols.DateOnly).should('have.text', newYearsEveZeroed);
      textContent(Rows.FormatDateBackend, Cols.String).should('have.text', newYearsEve);
      textContent(Rows.FormatDateBackend, Cols.DateTime).should('have.text', newYearsEve);
      textContent(Rows.FormatDateBackend, Cols.DateOnly).should('have.text', newYearsEveZeroed);
      datePickerContent(Rows.DatePicker, Cols.String).should('have.value', '01.01.2022');
      datePickerContent(Rows.DatePicker, Cols.DateTime).should('have.value', '01.01.2022');
      datePickerContent(Rows.DatePicker, Cols.DateOnly).should('have.value', '31.12.2021');

      // At this point the browser timezone starts to matter, because the date/time has specified a timezone. Thus
      // it needs to be converted to the local timezone before being displayed.
      cy.dsSelect('#datesDate', 'Midnatt i en annen tidssone');
      textContent(Rows.Raw, Cols.String).should('have.text', '2020-05-17 00:00:00-08:00');

      // Backend local time is Europe/Oslo, so the date will be converted to that timezone
      textContent(Rows.Raw, Cols.DateTime).should('have.text', '2020-05-17T10:00:00+02:00');
      textContent(Rows.Raw, Cols.DateOnly).should('have.text', '2020-05-17T00:00:00+02:00');
      const inOslo = '17.05.2020 10:00:00';
      const inOsloZeroed = '17.05.2020 00:00:00';
      const date = '17.05.2020';
      const dateZeroed = tz === newYork ? '16.05.2020' : '17.05.2020';
      const dependsOnTimezone = tz === newYork ? '17.05.2020 04:00:00' : inOslo;
      const dependsOnTimezoneZeroed = tz === newYork ? '16.05.2020 18:00:00' : inOsloZeroed;
      textContent(Rows.Date, Cols.String).should('have.text', dependsOnTimezone);
      textContent(Rows.Date, Cols.DateTime).should('have.text', dependsOnTimezone);
      textContent(Rows.Date, Cols.DateOnly).should('have.text', dependsOnTimezoneZeroed);
      textContent(Rows.FormatDate, Cols.String).should('have.text', dependsOnTimezone);
      textContent(Rows.FormatDate, Cols.DateTime).should('have.text', dependsOnTimezone);
      textContent(Rows.FormatDate, Cols.DateOnly).should('have.text', dependsOnTimezoneZeroed);
      textContent(Rows.FormatDateBackend, Cols.String).should('have.text', inOslo); // Backend local time
      textContent(Rows.FormatDateBackend, Cols.DateTime).should('have.text', inOslo);
      textContent(Rows.FormatDateBackend, Cols.DateOnly).should('have.text', inOsloZeroed);
      datePickerContent(Rows.DatePicker, Cols.String).should('have.value', date);
      datePickerContent(Rows.DatePicker, Cols.DateTime).should('have.value', date);
      datePickerContent(Rows.DatePicker, Cols.DateOnly).should('have.value', dateZeroed);

      cy.dsSelect('#datesDate', 'Midnatt i UTC');
      textContent(Rows.Raw, Cols.String).should('have.text', '2020-05-17T00:00:00Z');
      textContent(Rows.Raw, Cols.DateTime).should('have.text', '2020-05-17T02:00:00+02:00');
      textContent(Rows.Raw, Cols.DateOnly).should('have.text', '2020-05-17T00:00:00+02:00');
      const utcInOslo = '17.05.2020 02:00:00';
      const utcInOsloZeroed = '17.05.2020 00:00:00';
      const utcInBrowser = tz === newYork ? '16.05.2020 20:00:00' : utcInOslo;
      const utcInBrowserZeroed = tz === newYork ? '16.05.2020 18:00:00' : utcInOsloZeroed;
      const dateInUtc = tz === newYork ? '16.05.2020' : '17.05.2020';
      textContent(Rows.Date, Cols.String).should('have.text', utcInBrowser);
      textContent(Rows.Date, Cols.DateTime).should('have.text', utcInBrowser);
      textContent(Rows.Date, Cols.DateOnly).should('have.text', utcInBrowserZeroed);
      textContent(Rows.FormatDate, Cols.String).should('have.text', utcInBrowser);
      textContent(Rows.FormatDate, Cols.DateTime).should('have.text', utcInBrowser);
      textContent(Rows.FormatDate, Cols.DateOnly).should('have.text', utcInBrowserZeroed);
      textContent(Rows.FormatDateBackend, Cols.String).should('have.text', utcInOslo);
      textContent(Rows.FormatDateBackend, Cols.DateTime).should('have.text', utcInOslo);
      textContent(Rows.FormatDateBackend, Cols.DateOnly).should('have.text', utcInOsloZeroed);
      datePickerContent(Rows.DatePicker, Cols.String).should('have.value', dateInUtc);
      datePickerContent(Rows.DatePicker, Cols.DateTime).should('have.value', dateInUtc);
      datePickerContent(Rows.DatePicker, Cols.DateOnly).should('have.value', dateInUtc);
    });
  });
});
