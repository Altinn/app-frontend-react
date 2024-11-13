import React from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { Label as DesignsystemetLabel } from '@digdir/designsystemet-react';
import { PadlockLockedFillIcon } from '@navikt/aksel-icons';
import type { LabelProps as DesignsystemetLabelProps } from '@digdir/designsystemet-react';

type LabelProps = {
  label: string;
  required?: boolean;
  readonly?: boolean;
  help?: ReactElement;
  className?: string;
} & Pick<DesignsystemetLabelProps, 'htmlFor' | 'style'>;

export function Label({
  label,
  required,
  readonly,
  htmlFor,
  style,
  help,
  className,
  children,
}: PropsWithChildren<LabelProps>) {
  if (!label) {
    return children;
  }

  return (
    <DesignsystemetLabel
      weight='medium'
      size='md'
      htmlFor={htmlFor}
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', ...style }}
    >
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {readonly && (
          <PadlockLockedFillIcon
            aria-hidden
            className='fds-textfield__readonly__icon'
          />
        )}
        {label}
        {required && ' *'}
        {help}
      </div>
      {children}
    </DesignsystemetLabel>
  );
}
