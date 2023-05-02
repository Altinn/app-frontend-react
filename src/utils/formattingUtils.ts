type FormattingResult = {
  thousandSeparator: string | undefined;
  decimalSeparator: string | undefined;
  suffix: string | undefined;
  prefix: string | undefined;
};

export type CurrencyFormattingOptions = {
  style: 'currency';
  currency: string;
};

export type UnitFormattingOptions = {
  style: 'unit';
  unit: string;
};

export const formatNumber = (
  number: string,
  locale: string | null,
  options: CurrencyFormattingOptions | UnitFormattingOptions,
): FormattingResult => {
  const intlFormatting = new Intl.NumberFormat(locale || 'nb', options).formatToParts(parseFloat(number));

  const intlResult: FormattingResult = {
    thousandSeparator: undefined,
    decimalSeparator: undefined,
    prefix: undefined,
    suffix: undefined,
  };

  intlFormatting.forEach((part) => {
    if (part.type === 'group') {
      intlResult.thousandSeparator = part.value;
    }
    if (part.type === 'decimal') {
      intlResult.decimalSeparator = part.value;
    }
    if (part.type === 'currency') {
      intlResult.prefix = `${part.value} `;
    }
    if (part.type === 'unit') {
      intlResult.suffix = ` ${part.value}`;
    }
  });
  return intlResult;
};
