import React from 'react';

import { ErrorMessage } from '@digdir/designsystemet-react';
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { Label } from 'src/components/label/Label';
import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { useRepeatingGroupRowState } from 'src/layout/RepeatingGroup/RepeatingGroupProviders/RepeatingGroupContext';
import classes from 'src/layout/RepeatingGroup/Summary2/RepeatingGroupSummary.module.css';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { CompTypes } from 'src/layout/layout';
import type { AnyComponent } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

export const RepeatingGroupSummary = ({ target, isCompact, overrides }: Summary2Props<'RepeatingGroup'>) => {
  const validations = useUnifiedValidationsForNode(target);
  const { visibleRows } = useRepeatingGroupRowState();
  const errors = validationsOfSeverity(validations, 'error');
  const title = useNodeItem(target, (i) => i.textResourceBindings?.title);
  const rowsToDisplaySet = new Set(visibleRows.map((row) => row.uuid));
  const rows = useNodeItem(target, (i) => i.rows).filter((row) => row && rowsToDisplaySet.has(row.uuid));
  const isNested = target.parent instanceof BaseLayoutNode;

  if (rows.length === 0) {
    return (
      <SingleValueSummary
        componentNode={target}
        title={title}
      />
    );
  }

  return (
    <div
      className={cn({ [classes.nestedRepeatingGroupSummaryWrapper]: isNested })}
      data-testid={'summary-repeating-group-component'}
    >
      <Label
        node={target}
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
            {row?.items &&
              row.items.map((n) => (
                <NodeSummary
                  key={n.id}
                  target={n}
                  isCompact={isCompact}
                  overrides={overrides}
                />
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
              node={target}
            ></Lang>
          </ErrorMessage>
        ))}
    </div>
  );
};

function NodeSummary<T extends CompTypes>(props: Summary2Props<T>) {
  const def = props.target.def as unknown as AnyComponent<T>;
  return def.renderSummary2 ? def.renderSummary2(props) : null;
}
