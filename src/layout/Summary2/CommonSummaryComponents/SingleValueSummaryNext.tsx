import React from 'react';

import { Button, Label, Paragraph } from '@digdir/designsystemet-react';
import cn from 'classnames';

import classes from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary.module.css';
import type { BaseValidation } from 'src/features/validation';

type SingleValueSummaryProps = {
  title: React.ReactNode;
  errors?: BaseValidation[];
  displayData?: string;
  hideEditButton?: boolean;
  multiline?: boolean;
  isCompact?: boolean;
  emptyFieldText?: string;
};

export const SingleValueSummaryNext = ({
  title,
  errors,
  displayData,
  hideEditButton,
  multiline,
  isCompact,
}: SingleValueSummaryProps) => (
  <div
    className={classes.summaryItemWrapper}
    data-testid='summary-single-value-component'
  >
    <div className={classes.summaryItem}>
      <div className={cn(classes.labelValueWrapper, isCompact && classes.compact)}>
        <Label weight='regular'>
          {title}
          {!!title?.toString()?.length && isCompact && ':'}
        </Label>
        <Paragraph
          asChild
          className={cn(
            {
              [classes.error]: errors && errors?.length > 0,
              [classes.emptyValue]: !displayData,
              [classes.formValue]: displayData,
              [classes.multiline]: multiline,
            },
            classes.summaryValue,
          )}
        >
          <span>{displayData}</span>
        </Paragraph>
      </div>
      {!hideEditButton && (
        <Button
          className={classes.editButton}
          onClick={() => {
            console.log('edit');
          }}
          variant='tertiary'
        />
      )}
    </div>

    {/*{errors &&*/}
    {/*  errors?.length > 0 &&*/}
    {/*  errors?.map(({ message }) => <ErrorMessage key={message.key}>{message.key}</ErrorMessage>)}*/}
  </div>
);
