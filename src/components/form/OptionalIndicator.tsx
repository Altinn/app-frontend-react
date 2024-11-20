import React from 'react';

import { useLanguage } from 'src/features/language/useLanguage';

type OptionalIndicatorProps = {
  readOnly?: boolean;
} & (
  | {
      required: true;
      showOptionalMarking?: boolean;
    }
  | { required?: false; showOptionalMarking: boolean }
);

export const OptionalIndicator = ({ required, showOptionalMarking }: OptionalIndicatorProps) => {
  const { langAsString } = useLanguage();
  const shouldShowOptionalMarking = !required && showOptionalMarking;
  if (shouldShowOptionalMarking) {
    return (
      <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#6a6a6a' }}>{` (${langAsString(
        'general.optional',
      )})`}</span>
    );
  }
  return null;
};
