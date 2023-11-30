import React from 'react';
import type { HtmlHTMLAttributes } from 'react';

import { Label } from '@digdir/design-system-react';
import cn from 'classnames';

import classes from 'src/components/form/Caption.module.css';
import { Description } from 'src/components/form/Description';
import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { getPlainTextFromNode } from 'src/utils/stringHelper';
import type { ILabelSettings } from 'src/layout/common.generated';

type CaptionProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  helpText?: React.ReactNode;
  required?: boolean;
  labelSettings?: ILabelSettings;
} & Omit<HtmlHTMLAttributes<HTMLTableCaptionElement>, 'children' | 'title'>;

export const Caption = ({
  title,
  description,
  required,
  labelSettings,
  id,
  className,
  helpText,
  ...rest
}: CaptionProps) => (
  <caption
    {...rest}
    className={cn(classes.tableCaption, className)}
  >
    <Label
      as='div'
      className={classes.captionTitle}
    >
      {title}
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
          title={getPlainTextFromNode(title)}
        />
      )}
    </Label>
    {description && (
      <Description
        id={id}
        description={description}
      />
    )}
  </caption>
);
