import React from 'react';

import { Link, Table } from '@digdir/designsystemet-react';
import dot from 'dot-object';

import { Caption } from 'src/components/form/Caption';
import { useExternalApi } from 'src/features/externalApi/useExternalApi';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ColumnConfig } from 'src/layout/SimpleTable/config.generated';

export const SimpleTableComponent = ({ node }: PropsFromGenericComponent<'SimpleTable'>) => {
  const nodeItem = useNodeItem(node);

  const { data: externalApi } = useExternalApi(nodeItem.data.id);
  const data: unknown = nodeItem.data.path ? dot.pick(nodeItem.data.path, externalApi) : externalApi;

  if (!data) {
    return null;
  }

  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }

  return (
    <Table width='100%'>
      <Caption title={nodeItem.title} />
      <Table.Head>
        <Table.Row>
          {nodeItem.columns.map((column) => (
            <Table.HeaderCell key={column.id}>{column.title}</Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {data.map((row) => (
          <Table.Row key={String(row)}>
            {nodeItem.columns.map((column, idx) => (
              <Table.Cell key={`${column.id}[${idx}]`}>{renderColumn(column, row)}</Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

function renderColumn({ component }: ColumnConfig, row: unknown) {
  if (!row) {
    return null;
  }

  switch (component.type) {
    case 'Text':
      return row[component.valuePath];
    case 'Link':
      return (
        <Link
          href={row[component.hrefPath]}
          target='_blank'
        >
          {row[component.textPath]}
        </Link>
      );
  }
}
