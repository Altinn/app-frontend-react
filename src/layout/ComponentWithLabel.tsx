import React from 'react';
import type { ReactNode } from 'react';

import classes from 'src/layout/ComponentWithLabel.module.css';
import { LabelContent } from 'src/layout/LabelContent';
import type { ILabelSettings } from 'src/layout/common.generated';

export interface ComponentWithLabelProps {
  renderLabelAs?: 'legend' | 'span' | 'label';
  id: string;
  label?: string;
  helpText?: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  labelSettings?: ILabelSettings;
  children?: ReactNode;
}

export const ComponentWithLabel: React.FunctionComponent<ComponentWithLabelProps> = ({
  renderLabelAs,
  id,
  label,
  description,
  required,
  readOnly,
  helpText,
  labelSettings,
  children,
}) => {
  const labelContent = (
    <LabelContent
      label={label}
      description={description}
      required={required}
      readOnly={readOnly}
      helpText={helpText}
      labelSettings={labelSettings}
    />
  );

  if (renderLabelAs === 'label') {
    return (
      <div className={classes.fieldWrapper}>
        <label htmlFor={id}>{labelContent}</label>
        {children}
      </div>
    );
  }
  if (renderLabelAs === 'legend') {
    return (
      <fieldset className={classes.fieldWrapper}>
        <legend>{labelContent}</legend>
        {children}
      </fieldset>
    );
  }

  return (
    <div className={classes.fieldWrapper}>
      <span className='label'>{labelContent}</span>
      {children}
    </div>
  );
};
