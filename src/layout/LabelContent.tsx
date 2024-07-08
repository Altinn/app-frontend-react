import React from 'react';

import { HelpText } from '@digdir/designsystemet-react';

import { Description } from 'src/components/form/Description';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useFormComponentCtxStrict } from 'src/layout/FormComponentContext';
import classes from 'src/layout/LabelContent.module.css';
import type { ILabelSettings } from 'src/layout/common.generated';

export interface ComponentWithLabelProps {
  label?: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  helpText?: string;
  labelSettings?: ILabelSettings;
}

export const LabelContent: React.FunctionComponent<ComponentWithLabelProps> = ({
  label,
  description,
  required,
  readOnly,
  helpText,
  labelSettings,
}) => {
  const { overrideDisplay, id } = useFormComponentCtxStrict();
  const { langAsString } = useLanguage();

  if (overrideDisplay?.renderLabel === false) {
    return null;
  }

  return (
    <>
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
      <Description
        key={`description-${id}`}
        description={description}
        id={id}
      />
    </>
  );
};
