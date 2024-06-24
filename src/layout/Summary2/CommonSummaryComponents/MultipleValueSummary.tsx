import React from 'react';

import { ErrorMessage, Label, List, Paragraph } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { Lang } from 'src/features/language/Lang';
import { EditButton } from 'src/layout/Summary2/CommonSummaryComponents/EditButton';
import classes from 'src/layout/Summary2/CommonSummaryComponents/MultipleValueSummary.module.css';
import type { BaseValidation } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type MultipleValueSummaryProps = {
  title: React.ReactNode;
  errors: BaseValidation[];
  componentNode: LayoutNode;
  displayData?: string[];
  showAsList?: boolean;
};

export const MultipleValueSummary = ({
  title,
  errors,
  componentNode,
  displayData,
  showAsList,
}: MultipleValueSummaryProps) => {
  console.log('title', title);

  console.log('displayData', displayData);

  return (
    <div className={classes.checkboxSummaryItem}>
      <div className={cn(classes.labelValueWrapper, { [classes.error]: errors.length > 0 })}>
        <Label weight={'regular'}>{title}</Label>
        {displayData && showAsList && (
          <List.Root>
            <List.Unordered>
              {displayData?.map((item) => (
                <List.Item
                  key={`list-item-${item}`}
                  className={classes.formValue}
                >
                  {item}
                </List.Item>
              ))}
            </List.Unordered>
          </List.Root>
        )}
        {displayData && !showAsList && (
          <Paragraph
            asChild
            className={classes.formValue}
          >
            <span>{displayData}</span>
          </Paragraph>
        )}
        {!displayData && (
          <Paragraph
            asChild
            className={classes.emptyValue}
          >
            <span>
              <Lang id={'general.empty_summary'}></Lang>
            </span>
          </Paragraph>
        )}
        {errors.length > 0 &&
          errors.map(({ message }) => (
            <ErrorMessage key={message.key}>
              <Lang
                id={message.key}
                params={message.params}
                node={componentNode}
              ></Lang>
            </ErrorMessage>
          ))}
      </div>
      <EditButton
        className={classes.editButton}
        componentNode={componentNode}
        summaryComponentId={''}
      />
    </div>
  );
};
