import React from 'react';

import { Label, Paragraph } from '@digdir/designsystemet-react';

import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Input/InputComponentSummary.module.css';
import { EditButton } from 'src/layout/Summary2/EditButton';
import type { CompInputInternal } from 'src/layout/Input/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type InputComponentSummaryProps = {
  componentNode: LayoutNode<'Input'>;
  summaryOverrides?: CompInputInternal['summaryProps'];
  displayData: string;
};

export const InputComponentSummary = ({ componentNode, summaryOverrides, displayData }: InputComponentSummaryProps) => {
  if (summaryOverrides?.hidden) {
    return <h1>Im so hidden!!!</h1>;
  }
  const value = <Lang id={'general.empty_summary'}></Lang>;

  const { textResourceBindings } = componentNode.item;
  return (
    <div className={classes.inputSummaryItem}>
      <div className={classes.labelWrapper}>
        <Label weight={'regular'}>
          <Lang id={textResourceBindings?.title}></Lang>
        </Label>
        <EditButton
          className={classes.editButton}
          componentNode={componentNode}
          summaryComponentId={''}
        />
      </div>
      {displayData && (
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
          <span>{value}</span>
        </Paragraph>
      )}
    </div>
  );
};
