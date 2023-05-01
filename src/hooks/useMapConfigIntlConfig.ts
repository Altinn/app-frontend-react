import { useAppSelector } from 'src/hooks/useAppSelector';

export const useMapConfigIntlConfig = (value: string | undefined, formatting) => {
  const lang = useAppSelector((state) => state.textResources.language);

  type FormattingResult = {
    thousandSeparator: string | undefined;
    decimalSeparator: string | undefined;
    suffix: string | undefined;
    prefix: string | undefined;
  };

  if (!formatting?.currency && !formatting?.unit) {
    return formatting;
  }

  const formatNumber = (locale: string, number: string, formatType) => {
    const options = formatting.currency
      ? { style: 'currency', currency: formatting.currency }
      : { style: 'unit', unit: formatting.unit };

    const intlFormatting = new Intl.NumberFormat(locale, options).formatToParts(parseFloat(number));

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
        intlResult.prefix = `${part.value.toUpperCase()} `;
      }
      if (part.type === 'unit') {
        intlResult.suffix = ` ${part.value.toUpperCase()}`;
      }
    });

    formatType.number = Object.assign(intlResult, formatType.number);
    return formatType;
  };

  if (value) {
    return formatNumber(lang || 'nb', value, formatting);
  }
};

// type SeparatorResult = {
//   decimalSeparator: string | undefined;
//   thousandSeparator: string | undefined;
// };

// const getSeparator = (locale: string, getSeparatorFromNumber: string | undefined): SeparatorResult => {
//   const defaultSeparator = { decimalSeparator: undefined, thousandSeparator: undefined };

//   if (!getSeparatorFromNumber) {
//     return defaultSeparator;
//   }

//   const extractPartsFromIntl = (part: string) =>
//     new Intl.NumberFormat(locale).formatToParts(parseFloat(getSeparatorFromNumber)).find((p) => p.type === part)
//       ?.value;
//   //Thousand separator is called group
//   const partsMap: Record<string, keyof typeof defaultSeparator> = {
//     group: 'thousandSeparator',
//     decimal: 'decimalSeparator',
//   };
//   const parts = ['group', 'decimal'];
//   let separators = { ...defaultSeparator };
//   parts.forEach((part) => {
//     separators = {
//       ...separators,
//       [partsMap[part]]: extractPartsFromIntl(part),
//     };
//   });

//   return separators;
// };
// const allowAutoFormatting = true;
// const lang = useAppSelector((state) => state.textResources.language);
// let formattingToUse = { ...formatting };
// if (formatting?.number && allowAutoFormatting) {
//   const { thousandSeparator, decimalSeparator } = getSeparator(lang || 'nb', value);
//   formattingToUse = { ...formattingToUse, number: { thousandSeparator, decimalSeparator } };
// }
