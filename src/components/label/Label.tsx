import React from 'react';
import type { PropsWithChildren } from 'react';

import { Fieldset, Label as DesignsystemetLabel } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import cn from 'classnames';

import classes from 'src/components/label/Label.module.css';
import { LabelContent } from 'src/components/label/LabelContent';
import { gridBreakpoints } from 'src/utils/formComponentUtils';
import type { LabelContentProps } from 'src/components/label/LabelContent';
import type { IGridStyling, ILabelSettings } from 'src/layout/common.generated';

type LabelType = 'legend' | 'span' | 'label';

export type LabelProps = PropsWithChildren<{
  id: string;
  renderLabelAs: LabelType;
  required?: boolean;
  readOnly?: boolean;
  labelSettings?: ILabelSettings;
  grid?: { labelGrid?: IGridStyling };
  textResourceBindings?: {
    title?: string;
    description?: string;
    help?: string;
  };
  className?: string;
}>;

export function Label({
  id,
  renderLabelAs,
  required,
  readOnly,
  labelSettings,
  grid,
  textResourceBindings,
  children,
  className,
}: LabelProps) {
  if (!textResourceBindings?.title) {
    return <>{children}</>;
  }

  const labelId = `label-${id}`;
  const labelContentProps: Omit<LabelContentProps, 'id'> = {
    label: textResourceBindings.title,
    description: textResourceBindings.description,
    help: textResourceBindings.help,
    required,
    readOnly,
    labelSettings,
  };

  switch (renderLabelAs) {
    case 'legend': {
      return (
        <Fieldset
          size='small'
          className={cn(classes.fieldWrapper, classes.fullWidth)}
          legend={
            <LabelGridItemWrapper labelGrid={grid?.labelGrid}>
              <LabelContent
                id={labelId}
                {...labelContentProps}
              />
            </LabelGridItemWrapper>
          }
        >
          {children}
        </Fieldset>
      );
    }
    case 'label':
      return (
        <DesignsystemetLabel
          id={labelId}
          htmlFor={id}
          style={{ width: '100%' }}
          className={className}
        >
          <Grid
            container
            spacing={2}
          >
            <LabelGridItemWrapper labelGrid={grid?.labelGrid}>
              <LabelContent {...labelContentProps} />
            </LabelGridItemWrapper>
            {children}
          </Grid>
        </DesignsystemetLabel>
      );

    case 'span':
    default:
      return (
        <span className={cn(classes.fieldWrapper, className)}>
          {/* we want this "label" not to be rendered as a <label>,
           because it does not belong to an input element */}
          <LabelGridItemWrapper labelGrid={grid?.labelGrid}>
            <DesignsystemetLabel asChild>
              <LabelContent
                id={labelId}
                {...labelContentProps}
              />
            </DesignsystemetLabel>
          </LabelGridItemWrapper>
          {children}
        </span>
      );
  }
}

function LabelGridItemWrapper({ children, labelGrid }: PropsWithChildren<{ labelGrid?: IGridStyling }>) {
  return (
    <Grid
      item
      {...gridBreakpoints(labelGrid)}
    >
      {children}
    </Grid>
  );
}
