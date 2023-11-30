import React from 'react';
import type { HTMLAttributes } from 'react';

import { Fieldset as DSFieldset } from '@digdir/design-system-react';

import { Description } from 'src/components/form/Description';
import classes from 'src/components/form/Fieldset.module.css';
import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { getPlainTextFromNode } from 'src/utils/stringHelper';
import type { ILabelSettings } from 'src/layout/common.generated';

type FieldsetProps = {
  legend: React.ReactNode;
  description?: React.ReactNode;
  helpText?: React.ReactNode;
  required?: boolean;
  labelSettings?: ILabelSettings;
} & HTMLAttributes<HTMLFieldSetElement>;

export const Fieldset = ({
  legend,
  description,
  helpText,
  required,
  labelSettings,
  children,
  id,
  ...rest
}: FieldsetProps) => (
  <DSFieldset
    legend={
      <div className={classes.legendContent}>
        {legend}
        <RequiredIndicator
          required={required}
          readOnly={false}
        />
        <OptionalIndicator
          labelSettings={labelSettings}
          readOnly={false}
          required={required}
        />
        {helpText && (
          <HelpTextContainer
            helpText={helpText}
            title={getPlainTextFromNode(legend)}
          />
        )}
      </div>
    }
    description={
      description && (
        <Description
          id={id}
          description={description}
          className={classes.description}
        />
      )
    }
    {...rest}
  >
    {children}
  </DSFieldset>
);
