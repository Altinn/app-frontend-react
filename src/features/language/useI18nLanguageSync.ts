import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsCurrentLanguageResolved } from 'src/features/language/LanguageProvider';

export function useI18nLanguageSync(currentLanguage: string) {
  const languageResolved = useIsCurrentLanguageResolved();
  const {
    i18n: { changeLanguage, language },
  } = useTranslation();

  useEffect(() => {
    if (languageResolved && currentLanguage && language !== currentLanguage) {
      changeLanguage(currentLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, languageResolved, changeLanguage]);
}
