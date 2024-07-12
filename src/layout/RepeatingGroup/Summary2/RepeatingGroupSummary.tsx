import React from 'react';

import { Label } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { useRepeatingGroup } from 'src/layout/RepeatingGroup/RepeatingGroupProviders/RepeatingGroupContext';
import classes from 'src/layout/RepeatingGroup/Summary2/RepeatingGroupSummary.module.css';
import type { InputSummaryOverrideProps } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type RepeatingGroupComponentSummaryProps = {
  componentNode: LayoutNode<'RepeatingGroup'>;
  summaryOverrides?: InputSummaryOverrideProps;
};
export const RepeatingGroupSummary = ({ componentNode }: RepeatingGroupComponentSummaryProps) => {
  const validations = useUnifiedValidationsForNode(componentNode);
  const { rowsToDisplay } = useRepeatingGroup();
  const errors = validationsOfSeverity(validations, 'error');
  const title = componentNode.item.textResourceBindings?.title;
  const rowsToDisplaySet = new Set(rowsToDisplay.map((row) => row.uuid));

  const rows = componentNode.item.rows.filter((row) => rowsToDisplaySet.has(row.uuid));

  return (
    <>
      <Label weight={'medium'}>{<Lang id={title} />}</Label>
      {rows.map((row, index) => (
        <div
          key={row.uuid}
          className={cn(classes.repeatingGroupSummaryWrapper)}
          // className={cn({ [classes.repeatingGroupRow]: index < rows.length - 1 })}
        >
          {row.items &&
            row.items.map((layoutItem) => (
              <div
                key={layoutItem.item.id}
                className={cn(classes.repeatingGroupSummaryWrapper)}
              >
                {layoutItem.def.renderSummary2 && layoutItem.def.renderSummary2(layoutItem as LayoutNode<any>)}
              </div>
            ))}
          {index < rows.length - 1 && <hr />}
        </div>
      ))}
    </>
  );
};
