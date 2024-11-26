import React from 'react';
import type { JSX, PropsWithChildren, ReactElement } from 'react';

import { Label as DesignsystemetLabel } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import cn from 'classnames';
import type { LabelProps as DesignsystemetLabelProps } from '@digdir/designsystemet-react';

import classes from 'src/app-components/Label/Label.module.css';
import type { GridSize } from 'src/app-components/Label/types';

type LabelProps = {
  label: string | undefined;
  optionalIndicator?: ReactElement;
  help?: ReactElement;
  description?: ReactElement;
  className?: string;
  grid?: GridSize;
  required?: boolean;
  requiredIndicator?: JSX.Element;
  htmlFor?: DesignsystemetLabelProps['htmlFor'];
  style?: DesignsystemetLabelProps['style'];
};

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
    <Grid
      container
      spacing={2}
    >
      <Grid
        item
        {...(grid ?? { xs: 12 })}
      >
        <span className={classes.labelAndDescWrapper}>
          <span className={classes.labelAndHelpWrapper}>
            <DesignsystemetLabel
              weight='medium'
              size='md'
              htmlFor={htmlFor}
              className={cn(className)}
              style={style}
            >
              {label}
              {required && requiredIndicator}
              {!required && optionalIndicator}
            </DesignsystemetLabel>
            {help}
          </span>
          {description}
        </span>
      </Grid>
      {children}
    </Grid>
  );
}
