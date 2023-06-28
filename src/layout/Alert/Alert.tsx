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
  const { severity, useAsAlert, textResourceBindings } = node.item;
  const { langAsString } = useLanguage();

  const title = textResourceBindings?.title && langAsString(textResourceBindings.title);
  const description = textResourceBindings?.description && langAsString(textResourceBindings.description);

  return (
    <AlertDesignSystem
      severity={severity}
      role={useAsAlert ? 'alert' : undefined}
      aria-live={useAsAlert ? calculateAriaLive(severity) : undefined}
      aria-label={useAsAlert ? title : undefined}
    >
      <span className={styles.title}>{title}</span>
      <p className={styles.description}>{description}</p>
    </AlertDesignSystem>
  );
};
