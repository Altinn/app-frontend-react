import { formatNumber } from 'src/utils/formattingUtils';
import type { CurrencyFormattingOptions, UnitFormattingOptions } from 'src/utils/formattingUtils';

const value = '12000.20';
let language = 'en';
const currencyOptions: CurrencyFormattingOptions = { style: 'currency', currency: 'NOK' };
const unitOptions: UnitFormattingOptions = { style: 'unit', unit: 'kilogram' };
let position: string | undefined = 'prefix';

describe('numberFormatting', () => {
  it('return with correct number config', () => {
    const formattedNumber = { thousandSeparator: ',', decimalSeparator: '.', prefix: 'NOK ', suffix: undefined };
    expect(formattedNumber).toEqual(formatNumber(value, language, currencyOptions, position));
  });
  it('return with correct valuta and position when norwegian and position is undefined', () => {
    language = 'nb';
    position = undefined;
    expect('kr ').toEqual(formatNumber(value, language, currencyOptions, position).prefix);
  });
  it('return with correct unit and position when norwegian and position is undefined', () => {
    language = 'nb';
    position = undefined;
    expect(' kg').toEqual(formatNumber(value, language, unitOptions, position).suffix);
  });
});
