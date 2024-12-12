import React from 'react';
import type { JSX, PropsWithChildren, ReactElement } from 'react';

import { Label as DesignsystemetLabel } from '@digdir/designsystemet-react';
import cn from 'classnames';
import type { LabelProps as DesignsystemetLabelProps } from '@digdir/designsystemet-react';

import classes from 'src/app-components/Label/Label.module.css';
import { Flex } from 'src/components/Flex';
import type { IGridStyling } from 'src/layout/common.generated';

type LabelProps = {
  label: string | undefined;
  optionalIndicator?: ReactElement;
  help?: ReactElement;
  description?: ReactElement;
  className?: string;
  grid?: IGridStyling;
  required?: boolean;
  requiredIndicator?: JSX.Element;
} & Pick<DesignsystemetLabelProps, 'htmlFor' | 'style'>;

export function Label({
  label,
  required,
  requiredIndicator,
  optionalIndicator,
  help,
  description,
  htmlFor,
  style,
  className,
  grid,
  children,
}: PropsWithChildren<LabelProps>) {
  if (!label) {
    return children;
  }

  return (
    <Flex
      id={htmlFor}
      container
      spacing={2}
    >
      <Flex
        item
        size={grid ?? { xs: 12 }}
      >
        <span className={classes.labelAndDescWrapper}>
          <DesignsystemetLabel
            weight='medium'
            size='md'
            htmlFor={htmlFor}
            className={cn(classes.label, className)}
            style={style}
          >
            <div>
              {label}
              {required && requiredIndicator}
              {!required && optionalIndicator}
            </div>
            {help}
          </DesignsystemetLabel>
          {description && <div className={classes.description}>{description}</div>}
        </span>
      </Flex>
      {children}
    </Flex>
  );
}
