import React from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { Label as DesignsystemetLabel } from '@digdir/designsystemet-react';
import type { LabelProps as DesignsystemetLabelProps } from '@digdir/designsystemet-react';

type RequiredIndicatorProps =
  | { required: true; requiredIndicator: ReactElement }
  | { required?: false; requiredIndicator?: ReactElement };

type LabelProps = {
  label: string;
  optionalIndicator?: ReactElement;
  help?: ReactElement;
  className?: string;
} & RequiredIndicatorProps &
  Pick<DesignsystemetLabelProps, 'htmlFor' | 'style'>;

export function Label({
  label,
  required,
  requiredIndicator,
  optionalIndicator,
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
        {label}
        {required && requiredIndicator}
        {!required && optionalIndicator}
        {help}
      </div>
      {children}
    </DesignsystemetLabel>
  );
}
