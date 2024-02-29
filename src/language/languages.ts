import { en } from 'src/language/texts/en';
import { nb } from 'src/language/texts/nb';
import { nn } from 'src/language/texts/nn';

export type FixedLanguageList = ReturnType<typeof en>;

// This makes sure we don't generate a new object
// each time (which would fail shallow comparisons, in for example React.memo)
const cachedLanguages: Record<string, FixedLanguageList> = {};
const langFuncMap = { en, nb, nn };

export function getLanguageFromCode(languageCode: string) {
  if (cachedLanguages[languageCode]) {
    return cachedLanguages[languageCode];
  }

  const langFunc = langFuncMap[languageCode];
  if (langFunc) {
    const language = langFunc();
    cachedLanguages[languageCode] = language;
    return language;
  }

  return en();
}

export const rightToLeftISOLanguageCodes = [
  'ar', // Arabic
  'arc', // Aramaic
  'dv', // Divehi
  'fa', // Persian
  'ha', // Hausa
  'he', // Hebrew
  'khw', // Khowar
  'ks', // Kashmiri
  'ku', // Kurdish
  'ps', // Pashto
  'ur', // Urdu
  'yi', // Yiddish
];
