import React from 'react';

import { Table } from '@digdir/designsystemet-react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { EditButton } from 'src/layout/Summary2/CommonSummaryComponents/EditButton';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ListComponentSummaryProps = {
  isCompact?: boolean;
  componentNode: LayoutNode<'List'>;
  emptyFieldText?: string;
};

export const ListSummary = ({ componentNode, isCompact, emptyFieldText }: ListComponentSummaryProps) => {
  const displayData = componentNode.def.useDisplayData(componentNode);
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');
  const title = useNodeItem(componentNode, (i) => i.textResourceBindings?.title);

  const { tableHeaders, dataModelBindings } = useNodeItem(componentNode);
  const { formData } = useDataModelBindings(dataModelBindings, 1, 'raw');

  const displayRows: unknown[] = [];
  // @ts-expect-error Please replace with typechecking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData?.saveToList?.forEach((row: any) => {
    const { altinnRowId, ...rest } = row;
    displayRows.push(rest);
  });

  if (displayRows.length > 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--fds-spacing-6)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: '1.125rem' }}>
            <Lang id={title} />
          </span>
          <EditButton
            style={{ marginLeft: 'auto', minWidth: 'unset' }}
            componentNode={componentNode}
            summaryComponentId={''}
          />
        </div>
        <Table>
          <Table.Head>
            <Table.Row>
              {Object.entries(tableHeaders).map(([key, value]) => (
                <Table.HeaderCell key={key}>
                  <Lang id={value} />
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {displayRows.map((row, rowIndex) => {
              const rowItem = row as { array: unknown[] };
              return (
                <Table.Row key={rowIndex}>
                  {Object.entries(tableHeaders).map(([key, value]) => (
                    <Table.Cell
                      key={key}
                      align='left'
                    >
                      {rowItem[key]}
                    </Table.Cell>
                  ))}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    );
  }

  return (
    <SingleValueSummary
      title={
        title && (
          <Lang
            id={title}
            node={componentNode}
          />
        )
      }
      displayData={displayData}
      errors={errors}
      componentNode={componentNode}
      isCompact={isCompact}
      emptyFieldText={emptyFieldText}
    />
  );
};
