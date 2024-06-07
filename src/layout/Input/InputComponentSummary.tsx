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
  summaryOverrides?: CompInputInternal['summaryProps'];
  displayData: string;
};

export const InputComponentSummary = ({ componentNode, summaryOverrides, displayData }: InputComponentSummaryProps) => {
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');
  if (summaryOverrides?.hidden) {
    return <h1>Im so hidden!!!</h1>;
  }

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
          className={cn(classes.formValue, { [classes.error]: errors.length > 0 })}
        >
          <span>{displayData}</span>
        </Paragraph>
      )}
      {!displayData && (
        <Paragraph
          asChild
          className={cn(classes.emptyValue, { [classes.error]: errors.length > 0 })}
        >
          <span>{<Lang id={'general.empty_summary'}></Lang>}</span>
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
  );
};
