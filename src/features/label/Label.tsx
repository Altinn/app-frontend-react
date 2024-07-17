import React from 'react';
import type { PropsWithChildren } from 'react';

import { Fieldset, Label as DesignsystemetLabel } from '@digdir/designsystemet-react';

import classes from 'src/features/label/Label.module.css';
import { LabelContent } from 'src/features/label/LabelContent';
import type { LabelContentProps } from 'src/features/label/LabelContent';
import type { ILabelSettings } from 'src/layout/common.generated';

type LabelProps = PropsWithChildren<{
  id: string;
  renderLabelAs: 'legend' | 'span' | 'label';
  required?: boolean;
  readOnly?: boolean;
  labelSettings?: ILabelSettings;
  textResourceBindings?: {
    title?: string;
    description?: string;
    helpText?: string;
  };
}>;

export function Label({
  id,
  renderLabelAs,
  children,
  textResourceBindings,
  required,
  readOnly,
  labelSettings,
}: LabelProps) {
  if (!textResourceBindings?.title) {
    return <>{children}</>;
  }

  const labelId = `label-${id}`;
  const labelContentProps: Omit<LabelContentProps, 'id'> = {
    label: textResourceBindings.title,
    description: textResourceBindings.description,
    helpText: textResourceBindings.helpText,
    required,
    readOnly,
    labelSettings,
  };

  switch (renderLabelAs) {
    case 'legend': {
      return (
        <Fieldset
          size='small'
          className={classes.fieldWrapper}
          legend={
            <LabelContent
              id={labelId}
              {...labelContentProps}
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
          <DesignsystemetLabel
            id={labelId}
            htmlFor={id}
          >
            <LabelContent {...labelContentProps} />
          </DesignsystemetLabel>
          {children}
        </div>
      );

    case 'span':
    default:
      return (
        <div className={classes.fieldWrapper}>
          {/* we want this "label" to be rendered as a <span> and not a <label>,
           because it does not belong to an input element */}
          <DesignsystemetLabel asChild>
            <LabelContent
              id={labelId}
              {...labelContentProps}
            />
          </DesignsystemetLabel>
          {children}
        </div>
      );
  }
}
