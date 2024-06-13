import React from 'react';

import { Label, List, Paragraph } from '@digdir/designsystemet-react';

import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Checkboxes/CheckboxesSummary.module.css';
import { EditButton } from 'src/layout/Summary2/CommonSummaryComponents/EditButton';
import type { CompCheckboxesInternal } from 'src/layout/Checkboxes/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type CheckboxesSummaryProps = {
  componentNode: LayoutNode<'Checkboxes'>;
  summaryOverrides?: CompCheckboxesInternal['summaryProps'];
  displayData: string;
};

export const CheckboxesSummary = ({ componentNode, summaryOverrides, displayData }: CheckboxesSummaryProps) => {
  const maxStringLength = 75;
  const showAsList =
    summaryOverrides?.displayType === 'list' ||
    (!summaryOverrides?.displayType && displayData?.length >= maxStringLength);
  return (
    <>
      <div className={classes.labelWrapper}>
        <Label weight={'regular'}>
          <Lang id={componentNode.item.textResourceBindings?.title}></Lang>
        </Label>
        <EditButton
          className={classes.editButton}
          componentNode={componentNode}
          summaryComponentId={''}
        />
      </div>
      {showAsList && (
        <List.Root>
          <List.Unordered>
            {displayData.split(',').map((item) => (
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
      {!showAsList && (
        <Paragraph
          asChild
          className={classes.formValue}
        >
          <span>{displayData}</span>
        </Paragraph>
      )}
    </>
  );
};
