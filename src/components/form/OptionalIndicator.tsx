import React from 'react';

import { useLanguage } from 'src/features/language/useLanguage';

interface IOptionalIndicatorProps {
  optional: boolean;
  readOnly?: boolean;
}

export const OptionalIndicator = (props: IOptionalIndicatorProps) => {
  const { langAsString } = useLanguage();
  const shouldShowOptionalMarking = props.optional && !props.readOnly;
  if (shouldShowOptionalMarking) {
    return (
      <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#6a6a6a' }}>{` (${langAsString(
        'general.optional',
      )})`}</span>
    );
  }
  return null;
};
