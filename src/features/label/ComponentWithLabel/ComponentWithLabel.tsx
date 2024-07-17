import React from 'react';
import type { PropsWithChildren } from 'react';

import { Fieldset, Label } from '@digdir/designsystemet-react';

import classes from 'src/features/label/ComponentWithLabel/ComponentWithLabel.module.css';
import { LabelContent } from 'src/features/label/LabelContent/LabelContent';
import type { LabelContentProps } from 'src/features/label/LabelContent/LabelContent';

export type ComponentWithLabelProps = PropsWithChildren<
  LabelContentProps & {
    id: string;
    renderLabelAs: 'legend' | 'span' | 'label';
  }
>;

export function ComponentWithLabel({ id, renderLabelAs, children, ...labelProps }: ComponentWithLabelProps) {
  if (!labelProps.label) {
    return <>{children}</>;
  }

  const labelId = `label-${id}`;

  switch (renderLabelAs) {
    case 'legend': {
      return (
        <Fieldset
          size='small'
          className={classes.fieldWrapper}
          legend={
            <LabelContent
              id={labelId}
              {...labelProps}
            />
          }
        >
          {children}
        </Fieldset>
      );
    }
    case 'label':
      return (
        <div className={classes.fieldWrapper}>
          <Label
            id={labelId}
            htmlFor={id}
          >
            <LabelContent {...labelProps} />
          </Label>
          {children}
        </div>
      );

    case 'span':
    default:
      return (
        <div className={classes.fieldWrapper}>
          {/* we want this "label" to be rendered as a <span> and not a <label>,
           because it does not belong to an input element */}
          <Label asChild>
            <LabelContent
              id={labelId}
              {...labelProps}
            />
          </Label>
          {children}
        </div>
      );
  }
}
