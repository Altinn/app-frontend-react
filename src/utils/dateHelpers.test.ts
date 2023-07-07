import moment from 'moment';

import { DateFlags } from 'src/types/index';
import {
  DatepickerMaxDateDefault,
  DatepickerMinDateDefault,
  formatDate,
  getDateConstraint,
  getDateFormat,
  getSaveFormattedDateString,
  isValidDate,
  parseISOString,
} from 'src/utils/dateHelpers';

/**
 * Mock todays date to be 2023-07-07T12:54:25.000Z
 */
jest.spyOn(Date, 'now').mockImplementation(() => 1688734465000);

/**
 * The time zone is set to UTC when running tests
 */
describe('dateHelpers', () => {
  describe('getDateFormat', () => {
    const tests: { props: Parameters<typeof getDateFormat>; expected: ReturnType<typeof getDateFormat> }[] = [
      { props: ['YYYY-MM-DD'], expected: 'YYYY-MM-DD' },
      { props: ['YYYY/MM/DD'], expected: 'YYYY/MM/DD' },
      { props: ['YYYY.MM.DD'], expected: 'YYYY.MM.DD' },
      { props: [undefined, 'en'], expected: 'MM/DD/YYYY' },
      { props: [undefined, 'nb'], expected: 'DD.MM.YYYY' },
      { props: [undefined, undefined], expected: 'DD.MM.YYYY' },
    ];
    tests.forEach(({ props, expected }) => {
      it(`should return ${expected} when called with ${JSON.stringify(props)}`, () => {
        const result = getDateFormat(...props);
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
      { props: [moment('2020-12-31T12:00:00.000Z'), true], expected: '2020-12-31T12:00:00.000+00:00' },
      { props: [moment('2020-12-31T12:00:00.000Z'), false], expected: '2020-12-31' },
      { props: [moment('2018-01-05T20:00:00.000Z'), true], expected: '2018-01-05T20:00:00.000+00:00' },
      { props: [moment('2018-01-05T20:00:00.000Z'), false], expected: '2018-01-05' },
      { props: [moment('1987-01-03T12:00:00.000Z'), true], expected: '1987-01-03T12:00:00.000+00:00' },
      { props: [moment('1987-01-03T12:00:00.000Z'), false], expected: '1987-01-03' },
    ];
    tests.forEach(({ props, expected }) => {
      it(`should return ${expected} when called with ${JSON.stringify(props)}`, () => {
        const result = getSaveFormattedDateString(...props);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('getDateConstraint', () => {
    const tests: { props: Parameters<typeof getDateConstraint>; expected: ReturnType<typeof getDateConstraint> }[] = [
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
        expect(result).toEqual(expected);
      });
    });
  });

  describe('isValidDate', () => {
    const tests: { props: Parameters<typeof isValidDate>; expected: ReturnType<typeof isValidDate> }[] = [
      { props: [undefined], expected: false },
      { props: [null], expected: false },
      { props: [moment('2020-01-01')], expected: true },
      { props: [moment('2023-12-31')], expected: true },
      { props: [moment('2023-45-31')], expected: false },
      { props: [moment('2023-09-34')], expected: false },
      { props: [moment('asdf')], expected: false },
    ];
    tests.forEach(({ props, expected }) => {
      it(`should return ${expected} when called with ${JSON.stringify(props)}`, () => {
        const result = isValidDate(...props);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('formatDate', () => {
    const tests: { props: Parameters<typeof formatDate>; expected: ReturnType<typeof formatDate> }[] = [
      { props: [undefined, 'YYYY.MM.DD'], expected: null },
      { props: [null, 'YYYY.MM.DD'], expected: null },
      { props: [moment('2020-12-31T12:00:00.000Z'), 'YYYY.MM.DD'], expected: '2020.12.31' },
      { props: [moment('2020-12-31T12:00:00.000Z'), 'YYYY-MM-DD'], expected: '2020-12-31' },
      { props: [moment('2020-12-31T12:00:00.000Z'), 'YYYY/MM/DD'], expected: '2020/12/31' },
    ];
    tests.forEach(({ props, expected }) => {
      it(`should return ${expected} when called with ${JSON.stringify(props)}`, () => {
        const result = formatDate(...props);
        expect(result).toEqual(expected);
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
});
