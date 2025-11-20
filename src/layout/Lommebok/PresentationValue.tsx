import React from 'react';

import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { formatDateLocale } from 'src/utils/dateUtils';

interface PresentationValueProps {
  value: unknown;
  displayType?: 'string' | 'date' | 'image';
}

/**
 * Component to format and render a presentation field value based on its display type
 */
export function PresentationValue({ value, displayType }: PresentationValueProps) {
  const locale = useCurrentLanguage();
  const { langAsString } = useLanguage();

  if (value === null || value === undefined) {
    return null;
  }

  switch (displayType) {
    case 'date':
      // Assume ISO date string, format to locale
      if (typeof value === 'string') {
        try {
          const date = new Date(value);
          return <>{formatDateLocale(locale, date, 'dd.MM.yyyy')}</>;
        } catch {
          return <>{String(value)}</>;
        }
      }
      return <>{String(value)}</>;

    case 'image':
      // Assume base64 string
      if (typeof value === 'string') {
        return (
          <img
            src={value.startsWith('data:') ? value : `data:image/png;base64,${value}`}
            alt={langAsString('wallet.image_alt')}
            style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '8px' }}
          />
        );
      }
      return null;

    case 'string':
    default:
      return <>{String(value)}</>;
  }
}
