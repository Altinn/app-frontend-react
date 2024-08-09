import React from 'react';
import type { PropsWithChildren } from 'react';

import { Fieldset, Label as DesignsystemetLabel } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import cn from 'classnames';

import classes from 'src/components/label/Label.module.css';
import { LabelContent } from 'src/components/label/LabelContent';
import { gridBreakpoints } from 'src/utils/formComponentUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LabelContentProps } from 'src/components/label/LabelContent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { IGridStyling, TRBLabel } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type LabelType = 'legend' | 'span' | 'label';

export type LabelProps = PropsWithChildren<{
  node: LayoutNode;
  renderLabelAs: LabelType;
  className?: string;

  id?: string;
  textResourceBindings?: ExprResolved<TRBLabel>;
}>;

export function Label({ node, renderLabelAs, children, className, addBottomPadding, ...rest }: LabelProps) {
  const item = useNodeItem(node);
  const { id: nodeId, grid, textResourceBindings: _trb } = item;
  const required = 'required' in item && item.required;
  const readOnly = 'readOnly' in item && item.readOnly;
  const labelSettings = 'labelSettings' in item ? item.labelSettings : undefined;

  // These can be overridden by props, but are otherwise retrieved from the node item
  const id = rest.id ?? nodeId;
  const textResourceBindings = (rest.textResourceBindings ?? _trb) as ExprResolved<TRBLabel> | undefined;

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
