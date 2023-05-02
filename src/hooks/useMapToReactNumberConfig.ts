import { useAppSelector } from 'src/hooks/useAppSelector';
import { appLanguageStateSelector } from 'src/selectors/appLanguageStateSelector';
import { formatNumber } from 'src/utils/formattingUtils';
import type { IInputFormatting } from 'src/layout/layout';
import type { CurrencyFormattingOptions, UnitFormattingOptions } from 'src/utils/formattingUtils';

export const useMapToReactNumberConfig = (value: string | undefined, formatting: IInputFormatting) => {
  const appLanguage = useAppSelector(appLanguageStateSelector);

  if ((!formatting?.currency && !formatting?.unit) || !value) {
    return formatting;
  }

  const options = formatting.currency
    ? ({ style: 'currency', currency: formatting.currency } as CurrencyFormattingOptions)
    : ({ style: 'unit', unit: formatting.unit } as UnitFormattingOptions);

  const numberFormatResult = { ...formatNumber(value, appLanguage, options), ...formatting.number };
  return { ...formatting, number: numberFormatResult };
};
