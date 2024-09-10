import React from 'react';

import { ErrorMessage } from '@digdir/designsystemet-react';
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { Label } from 'src/components/label/Label';
import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { useRepeatingGroupRowState } from 'src/layout/RepeatingGroup/Providers/RepeatingGroupContext';
import classes from 'src/layout/RepeatingGroup/Summary2/RepeatingGroupSummary.module.css';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import { ComponentSummary } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { useNodeItem } from 'src/utils/layout/useNodeItem';

export const RepeatingGroupSummary = ({
  componentNode,
  isCompact,
  emptyFieldText,
}: {
  componentNode: BaseLayoutNode<'RepeatingGroup'>;
  isCompact?: boolean;
  emptyFieldText?: string;
}) => {
  const validations = useUnifiedValidationsForNode(componentNode);
  const { visibleRows } = useRepeatingGroupRowState();
  const rowsToDisplaySet = new Set(visibleRows.map((row) => row.uuid));
  const rows = useNodeItem(componentNode, (i) => i.rows).filter((row) => row && rowsToDisplaySet.has(row.uuid));
  const errors = validationsOfSeverity(validations, 'error');
  const title = useNodeItem(componentNode, (i) => i.textResourceBindings?.title);
  const isNested = componentNode.parent instanceof BaseLayoutNode;

  if (rows.length === 0) {
    return (
      <SingleValueSummary
        title={title}
        componentNode={componentNode}
        emptyFieldText={emptyFieldText}
      />
    );
  }

  return (
    <div
      className={cn({ [classes.nestedRepeatingGroupSummaryWrapper]: isNested })}
      data-testid={'summary-repeating-group-component'}
    >
      <Label
        node={componentNode}
        renderLabelAs='span'
        textResourceBindings={{ title }}
      />
      <div className={cn({ [classes.nestedRepeatingGroupContentWrapper]: isNested })}>
        {rows.map((row, index) => (
          <div
            key={row?.uuid}
            className={cn(classes.repeatingGroupSummaryRow, {
              [classes.repeatingGroupRowDivider]: index < rows.length - 1,
            })}
          >
            {row?.items?.map((node) => (
              <ComponentSummary
                key={node.id}
                componentNode={node}
              />
            ))}
          </div>
        ))}
      </div>
      {errors?.map(({ message }) => (
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