import { useMemo } from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import type { FixedLanguageList } from 'src/language/languages';

export function useLegacyNestedTexts() {
  const { language } = useLanguage();

  return useMemo(() => convertToLegacyNestedTexts(language), [language]);
}

interface NestedTexts {
  [n: string]: string | NestedTexts;
}

/**
 * Splits the text keys by '.' and creates a nested object.
 */
export function convertToLegacyNestedTexts(language: FixedLanguageList): NestedTexts {
  const result: NestedTexts = {};

  for (const [key, value] of Object.entries(language)) {
    const parts = key.split('.');
    let current = result;

    // Navigate through the parts to create nested objects
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as NestedTexts;
    }

    // Set the value at the deepest level
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }

  return result;
}
