import { jest } from '@jest/globals';
import { format, parseISO } from 'date-fns';

import { DateFlags } from 'src/types';
import {
  convertToDatepickerFormat,
  DatepickerMaxDateDefault,
  DatepickerMinDateDefault,
  DatepickerSaveFormatNoTimestamp,
  formatISOString,
  getDateConstraint,
  getDateFormat,
  getSaveFormattedDateString,
  parseISOString,
} from 'src/utils/dateHelpers';

describe('dateHelpers', () => {
  beforeAll(() => {
    /**
     * Mock todays date to be 2023-07-07T12:54:25.000Z
     */
    jest.useFakeTimers({ now: 1688734465000 });
  });

  describe('getDateFormat', () => {
    const tests: { props: Parameters<typeof getDateFormat>; expected: ReturnType<typeof getDateFormat> }[] = [
      { props: ['YYYY-MM-DD'], expected: 'yyyy-MM-dd' },
      { props: ['DD/MM/YYYY'], expected: 'dd/MM/yyyy' },
      { props: ['DD.MM.YYYY'], expected: 'dd.MM.y' },
      { props: ['yyyy-MM-dd'], expected: 'yyyy-MM-dd' },
      { props: ['dd/MM/yyyy'], expected: 'dd/MM/yyyy' },
      { props: ['dd.MM.y'], expected: 'dd.MM.y' },
      { props: [undefined, 'en'], expected: 'MM/dd/yyyy' },
      { props: [undefined, 'nb'], expected: 'dd.MM.y' },
      { props: [undefined, undefined], expected: 'dd.MM.y' },
    ];
    tests.forEach(({ props, expected }) => {
      it(`should return ${expected} when called with ${JSON.stringify(props)}`, () => {
        const result = getDateFormat(...props);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('convertToDatepickerFormat', () => {
    const tests: {
      props: Parameters<typeof convertToDatepickerFormat>;
      expected: ReturnType<typeof convertToDatepickerFormat>;
    }[] = [
      { props: ['yyyy-MM-dd'], expected: 'YYYY-MM-DD' },
      { props: ['dd/MM/yyyy'], expected: 'DD/MM/YYYY' },
      { props: ['dd.MM.y'], expected: 'DD.MM.YYYY' },
    ];
    tests.forEach(({ props, expected }) => {
      it(`should return ${expected} when called with ${JSON.stringify(props)}`, () => {
        const result = convertToDatepickerFormat(...props);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('getSaveFormattedDateString', () => {
    const tests: {
      props: Parameters<typeof getSaveFormattedDateString>;
      expected: ReturnType<typeof getSaveFormattedDateString>;
    }[] = [
      { props: [null, true], expected: '' },
      { props: [null, false], expected: '' },
      { props: [parseISO('2020-12-31T12:00:00.000Z'), true], expected: '2020-12-31T12:00:00.000+00:00' },
      { props: [parseISO('2020-12-31T12:00:00.000Z'), false], expected: '2020-12-31' },
      { props: [parseISO('2018-01-05T20:00:00.000Z'), true], expected: '2018-01-05T20:00:00.000+00:00' },
      { props: [parseISO('2018-01-05T20:00:00.000Z'), false], expected: '2018-01-05' },
      { props: [parseISO('1987-01-03T12:00:00.000Z'), true], expected: '1987-01-03T12:00:00.000+00:00' },
      { props: [parseISO('1987-01-03T12:00:00.000Z'), false], expected: '1987-01-03' },
    ];
    tests.forEach(({ props, expected }) => {
      it(`should return ${expected} when called with ${JSON.stringify(props)}`, () => {
        const result = getSaveFormattedDateString(...props);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('getDateConstraint', () => {
    const tests: { props: Parameters<typeof getDateConstraint>; expected: string }[] = [
      { props: [undefined, 'min'], expected: DatepickerMinDateDefault },
      { props: [undefined, 'max'], expected: DatepickerMaxDateDefault },
      { props: ['', 'min'], expected: DatepickerMinDateDefault },
      { props: ['', 'max'], expected: DatepickerMaxDateDefault },
      { props: ['asdf', 'min'], expected: DatepickerMinDateDefault },
      { props: ['asdf', 'max'], expected: DatepickerMaxDateDefault },
      { props: ['2022-45-15', 'min'], expected: DatepickerMinDateDefault },
      { props: ['2022-45-15', 'max'], expected: DatepickerMaxDateDefault },
      { props: [DateFlags.Today, 'min'], expected: '2023-07-07' },
      { props: [DateFlags.Today, 'max'], expected: '2023-07-07' },
      { props: ['2022-11-05T12:00:00.000Z', 'min'], expected: '2022-11-05' },
      { props: ['2022-11-05T12:00:00.000Z', 'max'], expected: '2022-11-05' },
      { props: ['2022-01-31', 'min'], expected: '2022-01-31' },
      { props: ['2022-01-31', 'max'], expected: '2022-01-31' },
    ];
    tests.forEach(({ props, expected }) => {
      it(`should return ${expected} when called with ${JSON.stringify(props)}`, () => {
        const result = getDateConstraint(...props);
        expect(format(result, DatepickerSaveFormatNoTimestamp)).toEqual(expected);
      });
    });
  });

  describe('parseISOString', () => {
    const tests: {
      props: Parameters<typeof parseISOString>;
      expected: Omit<ReturnType<typeof parseISOString>, 'date'> & { date: string | null };
    }[] = [
      { props: [undefined], expected: { isValid: false, date: null, input: '' } },
      { props: ['asdf'], expected: { isValid: false, date: null, input: 'asdf' } },
      { props: ['2023-45-01'], expected: { isValid: false, date: null, input: '2023-45-01' } },
      { props: ['2023-05-34'], expected: { isValid: false, date: null, input: '2023-05-34' } },
      {
        props: ['2023-13-33T23:00:00.000Z'],
        expected: { isValid: false, date: null, input: '2023-13-33T23:00:00.000Z' },
      },
      { props: ['2023-07-07'], expected: { isValid: true, date: '2023-07-07T00:00:00.000Z', input: undefined } },
      {
        props: ['2023-07-07T00:00:00.000Z'],
        expected: { isValid: true, date: '2023-07-07T00:00:00.000Z', input: undefined },
      },
      {
        props: ['2023-12-31T23:00:00.000Z'],
        expected: { isValid: true, date: '2023-12-31T23:00:00.000Z', input: undefined },
      },
    ];
    tests.forEach(({ props, expected }) => {
      it(`should return ${JSON.stringify(expected)} when called with ${JSON.stringify(props)}`, () => {
        const { isValid, date, input } = parseISOString(...props);
        expect(isValid).toEqual(expected.isValid);
        const dateStr = date?.toISOString() ?? null;
        expect(dateStr).toEqual(expected.date);
        expect(input).toEqual(expected.input);
      });
    });
  });

  describe('formatISOString', () => {
    const tests: { props: Parameters<typeof formatISOString>; expected: ReturnType<typeof formatISOString> }[] = [
      { props: [undefined, 'dd/MM/yyyy'], expected: null },
      { props: ['2023-13-01', 'dd/MM/yyyy'], expected: null },
      { props: ['2023-10-41', 'dd/MM/yyyy'], expected: null },
      { props: ['2023-01-04T12:69:00.000Z', 'dd/MM/yyyy'], expected: null },
      { props: ['2020-12-31T12:00:00.000Z', 'dd/MM/yyyy'], expected: '31/12/2020' },
      { props: ['2020-12-31T12:00:00.000Z', 'yyyy-MM-dd'], expected: '2020-12-31' },
      { props: ['2020-12-31T12:00:00.000Z', 'yyyy/MM/dd'], expected: '2020/12/31' },
      { props: ['2023-09-01', 'dd.MM.y'], expected: '01.09.2023' },
    ];
    tests.forEach(({ props, expected }) => {
      it(`should return ${expected} when called with ${JSON.stringify(props)}`, () => {
        const result = formatISOString(...props);
        expect(result).toEqual(expected);
      });
    });
  });
});
