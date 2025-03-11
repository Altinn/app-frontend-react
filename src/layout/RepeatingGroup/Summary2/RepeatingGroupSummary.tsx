import React from 'react';

import { ErrorMessage, Heading } from '@digdir/designsystemet-react';
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { Flex } from 'src/app-components/Flex/Flex';
import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { useRepeatingGroupRowState } from 'src/layout/RepeatingGroup/Providers/RepeatingGroupContext';
import classes from 'src/layout/RepeatingGroup/Summary2/RepeatingGroupSummary.module.css';
import { RepeatingGroupTableSummary } from 'src/layout/RepeatingGroup/Summary2/RepeatingGroupTableSummary/RepeatingGroupTableSummary';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import { ComponentSummaryById } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { DataModelLocationProvider } from 'src/utils/layout/DataModelLocation';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { useNodeItem } from 'src/utils/layout/useNodeItem';

export const RepeatingGroupSummary = ({
  componentNode,
  isCompact,
  display,
  emptyFieldText,
}: {
  componentNode: BaseLayoutNode<'RepeatingGroup'>;
  isCompact?: boolean;
  display?: 'table' | 'full';
  emptyFieldText?: string;
}) => {
  const { visibleRows } = useRepeatingGroupRowState();
  const rowsToDisplaySet = new Set(visibleRows.map((row) => row.uuid));
  const rows = useNodeItem(componentNode, (i) => i.rows).filter((row) => row && rowsToDisplaySet.has(row.uuid));
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');
  const title = useNodeItem(componentNode, (i) => i.textResourceBindings?.title);
  const dataModelBindings = useNodeItem(componentNode, (i) => i.dataModelBindings);
  const isNested = componentNode.parent instanceof BaseLayoutNode;

  if (rows.length === 0) {
    return (
      <SingleValueSummary
        title={title}
        componentNode={componentNode}
        errors={errors}
        isCompact={isCompact}
        emptyFieldText={emptyFieldText}
      />
    );
  }

  if (display === 'table' && componentNode) {
    return <RepeatingGroupTableSummary componentNode={componentNode} />;
  }

  return (
    <div
      className={cn(classes.summaryWrapper, { [classes.nestedSummaryWrapper]: isNested })}
      data-testid='summary-repeating-group-component'
    >
      <Heading
        size='xs'
        level={4}
      >
        <Lang
          id={title}
          node={componentNode}
        />
      </Heading>
      <div className={cn(classes.contentWrapper, { [classes.nestedContentWrapper]: isNested })}>
        {rows.map((row) => {
          if (!row) {
            return null;
          }

          return (
            <DataModelLocationProvider
              key={row?.uuid}
              binding={dataModelBindings.group}
              rowIndex={row.index}
            >
              {row.index != 0 && <hr className={classes.rowDivider} />}
              <Flex
                key={row?.uuid}
                container
                spacing={6}
                alignItems='flex-start'
              >
                {row?.itemIds?.map((nodeId) => (
                  <ComponentSummaryById
                    key={nodeId}
                    componentId={nodeId}
                  />
                ))}
              </Flex>
            </DataModelLocationProvider>
          );
        })}
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
          />
        </ErrorMessage>
      ))}
    </div>
  );
};
