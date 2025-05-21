import { useTranslation } from 'react-i18next';

import type { TOptionsBase } from 'i18next';
import type { $Dictionary } from 'i18next/typescript/helpers';

import { useCurrentLanguage } from 'src/features/language/LanguageProvider';

export function useResolveText() {
  const selectedLanguage = useCurrentLanguage();
  const { t } = useTranslation();

  return (key: string | string[], options?: TOptionsBase & $Dictionary) =>
    t(key, { ...options, lng: selectedLanguage });
}
