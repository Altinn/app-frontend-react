import React from 'react';

import { ErrorMessage } from '@digdir/designsystemet-react';
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { Label } from 'src/components/label/Label';
import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { useRepeatingGroup } from 'src/layout/RepeatingGroup/RepeatingGroupProviders/RepeatingGroupContext';
import classes from 'src/layout/RepeatingGroup/Summary2/RepeatingGroupSummary.module.css';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import { BaseLayoutNode, type LayoutNode } from 'src/utils/layout/LayoutNode';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { CompInternal } from 'src/layout/layout';

type RepeatingGroupComponentSummaryProps = {
  componentNode: LayoutNode<'RepeatingGroup'>;
  summaryOverrides?: CompInternal<'Summary2'>['overrides'];
};
export const RepeatingGroupSummary = ({ componentNode }: RepeatingGroupComponentSummaryProps) => {
  const validations = useUnifiedValidationsForNode(componentNode);
  const { rowsToDisplay } = useRepeatingGroup();
  const errors = validationsOfSeverity(validations, 'error');
  const title = useNodeItem(componentNode, (i) => i.textResourceBindings?.title);
  const rowsToDisplaySet = new Set(rowsToDisplay.map((row) => row.uuid));
  const rows = componentNode.item.rows.filter((row) => rowsToDisplaySet.has(row.uuid));
  const isNested = componentNode.parent instanceof BaseLayoutNode;

  if (rows.length === 0) {
    return (
      <SingleValueSummary
        componentNode={componentNode}
        title={title}
      />
    );
  }

  return (
    <div className={cn({ [classes.nestedRepeatingGroupSummaryWrapper]: isNested })}>
      <Label
        node={componentNode}
        renderLabelAs='span'
        textResourceBindings={{ title }}
      />
      <div className={cn({ [classes.nestedRepeatingGroupContentWrapper]: isNested })}>
        {rows.map((row, index) => (
          <div
            key={row.uuid}
            className={cn(classes.repeatingGroupSummaryRow, {
              [classes.repeatingGroupRowDivider]: index < rows.length - 1,
            })}
          >
            {row.items &&
              row.items.map((layoutItem) => (
                <div key={layoutItem.item.id}>
                  {layoutItem.def.renderSummary2 && layoutItem.def.renderSummary2(layoutItem as LayoutNode<any>)}
                </div>
              ))}
          </div>
        ))}
      </div>
      {errors &&
        errors?.length > 0 &&
        errors?.map(({ message }) => (
          <ErrorMessage
            key={message.key}
            className={classes.errorMessage}
          >
            <ExclamationmarkTriangleIcon fontSize='1.5rem' />
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
