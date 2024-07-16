import React from 'react';

import { HelpText } from '@digdir/designsystemet-react';

import { Description } from 'src/components/form/Description';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import classes from 'src/features/label/LabelContent/LabelContent.module.css';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useFormComponentCtxStrict } from 'src/layout/FormComponentContext';
import type { ILabelSettings } from 'src/layout/common.generated';

export type LabelContentProps = {
  label?: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  helpText?: string;
  labelSettings?: ILabelSettings;
};

export function LabelContent({ label, description, required, readOnly, helpText, labelSettings }: LabelContentProps) {
  const { overrideDisplay, id } = useFormComponentCtxStrict();
  const { langAsString } = useLanguage();

  if (overrideDisplay?.renderLabel === false) {
    return null;
  }

  return (
    <span
      data-testid={`label-${id}`}
      id={`label-${id}`}
    >
      <span className={classes.labelContainer}>
        <span className={classes.labelContent}>
          <Lang id={label} />
          <RequiredIndicator
            required={required}
            readOnly={readOnly}
          />
          <OptionalIndicator
            labelSettings={labelSettings}
            readOnly={readOnly}
            required={required}
          />
        </span>
        {helpText && (
          <HelpText title={langAsString(helpText)}>
            <Lang id={helpText} />
          </HelpText>
        )}
      </span>
      {description && (
        <Description
          key={`description-${id}`}
          description={description}
          id={id}
        />
      )}
    </span>
  );
}
