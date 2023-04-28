import { useAppSelector } from 'src/hooks/useAppSelector';

useAppSelector;

export const useMapConfigIntlConfig = (value: string | undefined, formatting) => {
  const lang = useAppSelector((state) => state.textResources.language);
  // const intlFormat = formatting.intlFormat;
  console.log(value);
  console.log(formatting);
  const formatNumber = (locale: string, number: string, formatType) => {
    const options = formatting.currency
      ? { style: 'currency', currency: formatting.currency }
      : { style: 'unit', unit: formatting.unit };

    const intlFormatting = new Intl.NumberFormat(locale, options).formatToParts(parseFloat(number));
    console.log(intlFormatting); //group: thousandSeparator, decimal: decimalSeparator, currency: prefix, unit: suffix

    // const formatKey = Object.keys(formatType)[0];
    // const formatKeyValue = Object.values(formatType)[0];
    // const options = { style: formatKey, [formatKey]: formatKeyValue };

    // const intlFormatting = new Intl.NumberFormat(locale, options).format(parseFloat(number));
  };

  if ((formatting.currency || formatting.unit) && value) {
    console.log('he');
    formatNumber(lang || 'nb', value, formatting);
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
