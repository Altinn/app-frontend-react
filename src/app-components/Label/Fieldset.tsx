import React from 'react';
import type { JSX, PropsWithChildren, ReactElement } from 'react';

import { Fieldset as DesignsystemetFieldset, Label as DesignsystemetLabel } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import cn from 'classnames';
import type { LabelProps as DesignsystemetLabelProps } from '@digdir/designsystemet-react';

import labelClasses from 'src/app-components/Label/Label.module.css';
import type { GridSize } from 'src/app-components/Label/types';

export type FieldsetProps = {
  id?: string;
  legend: string | ReactElement | undefined;
  className?: string;
  grid?: GridSize;
  optionalIndicator?: ReactElement;
  help?: ReactElement;
  description?: ReactElement;
  required?: boolean;
  requiredIndicator?: JSX.Element;
  style?: DesignsystemetLabelProps['style'];
};

export function Fieldset({
  id,
  children,
  className,
  legend,
  grid,
  style,
  help,
  description,
  required,
  requiredIndicator,
  optionalIndicator,
}: PropsWithChildren<FieldsetProps>) {
  if (!legend) {
    return children;
  }

  return (
    <Grid
      id={id}
      container
      spacing={2}
    >
      <Grid
        item
        {...(grid ?? { xs: 12 })}
      >
        <DesignsystemetFieldset
          className={cn(className)}
          legend={
            <span className={cn(labelClasses.labelAndHelpWrapper)}>
              <DesignsystemetLabel
                weight='medium'
                size='md'
                style={style}
                asChild
              >
                <span>
                  {legend}
                  {required && requiredIndicator}
                  {!required && optionalIndicator}
                </span>
              </DesignsystemetLabel>
              {help}
            </span>
          }
          // FIXME: find a way to use classnames for setting font size. Not working currently
          description={<div style={{ fontSize: '1rem' }}>{description}</div>}
        >
          {children}
        </DesignsystemetFieldset>
      </Grid>
    </Grid>
  );
}
