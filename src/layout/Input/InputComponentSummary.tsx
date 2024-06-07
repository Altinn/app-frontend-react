import React from 'react';

import { ErrorMessage, Label, Paragraph } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import classes from 'src/layout/Input/InputComponentSummary.module.css';
import { EditButton } from 'src/layout/Summary2/EditButton';
import type { CompInputInternal } from 'src/layout/Input/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type InputComponentSummaryProps = {
  componentNode: LayoutNode<'Input'>;
  displayData: string;
  summaryOverrides?: CompInputInternal['summaryProps'];
};

export const InputComponentSummary = ({ componentNode, displayData, summaryOverrides }: InputComponentSummaryProps) => {
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');

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
      <Paragraph
        asChild
        className={cn({
          [classes.error]: errors.length > 0,
          [classes.emptyValue]: !displayData,
          [classes.formValue]: displayData,
        })}
      >
        <span>
          {!displayData && <Lang id={'general.empty_summary'}></Lang>}
          {displayData}
        </span>
      </Paragraph>
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
  );
};
