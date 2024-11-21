import React from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { Label as DesignsystemetLabel } from '@digdir/designsystemet-react';
import cn from 'classnames';
import type { LabelProps as DesignsystemetLabelProps } from '@digdir/designsystemet-react';

import classes from 'src/app-components/Label/Label.module.css';

type RequiredIndicatorProps =
  | { required: true; requiredIndicator: ReactElement }
  | { required?: false; requiredIndicator?: ReactElement };

type LabelProps = {
  label: string;
  optionalIndicator?: ReactElement;
  help?: ReactElement;
  description?: ReactElement;
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
  description,
  className,
  children,
}: PropsWithChildren<LabelProps>) {
  if (!label) {
    return children;
  }

  return (
    <>
      <DesignsystemetLabel
        weight='medium'
        size='md'
        htmlFor={htmlFor}
        className={cn(classes.bottomPadding, classes.label, className)}
        style={style}
      >
        <div>
          {label}
          {required && requiredIndicator}
          {!required && optionalIndicator}
        </div>
        {help}
      </DesignsystemetLabel>
      {description && <span className={classes.bottomPadding}>{description}</span>}
      {children}
    </>
  );
}
