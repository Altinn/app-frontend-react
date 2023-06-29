import React from 'react';

import { Alert as AlertDesignSystem } from '@digdir/design-system-react';

import { useLanguage } from 'src/hooks/useLanguage';
import type { PropsFromGenericComponent } from 'src/layout';

export type AlertProps = PropsFromGenericComponent<'Alert'>;

import styles from 'src/layout/Alert/Alert.module.css';
import type { AlertSeverity } from 'src/layout/Alert/types';

function calculateAriaLive(severity: AlertSeverity): 'polite' | 'assertive' {
  if (severity === 'warning' || severity === 'danger') {
    return 'assertive';
  }
  return 'polite';
}

export const Alert = ({ node }: AlertProps) => {
  const { severity, textResourceBindings, hidden } = node.item;
  const { langAsString } = useLanguage();

  const title = textResourceBindings?.title && langAsString(textResourceBindings.title);
  const description = textResourceBindings?.description && langAsString(textResourceBindings.description);
  const shouldAlertScreenReaders = hidden === false;

  return (
    <AlertDesignSystem
      severity={severity}
      role={shouldAlertScreenReaders ? 'alert' : undefined}
      aria-live={shouldAlertScreenReaders ? calculateAriaLive(severity) : undefined}
      aria-label={shouldAlertScreenReaders ? title : undefined}
    >
      <span className={styles.title}>{title}</span>
      <p className={styles.description}>{description}</p>
    </AlertDesignSystem>
  );
};
