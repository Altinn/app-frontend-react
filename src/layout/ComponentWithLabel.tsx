import React from 'react';
import type { ReactNode } from 'react';

import { LabelContent } from 'src/layout/LabelContent';
import type { ILabelSettings } from 'src/layout/common.generated';

export interface ComponentWithLabelProps {
  renderLabelAs?: 'legend' | 'span';
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
  label,
  description,
  required,
  readOnly,
  helpText,
  labelSettings,
  children,
}) => (
  <div>
    <LabelContent
      renderLabelAs={renderLabelAs}
      label={label}
      description={description}
      required={required}
      readOnly={readOnly}
      helpText={helpText}
      labelSettings={labelSettings}
    />
    {children}
  </div>
);
