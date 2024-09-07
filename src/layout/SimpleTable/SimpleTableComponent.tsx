import React from 'react';

import { Link, Table } from '@digdir/designsystemet-react';
import dot from 'dot-object';

import { Caption } from 'src/components/form/Caption';
import { useExternalApi } from 'src/features/externalApi/useExternalApi';
import { ErrorList } from 'src/layout/GenericComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ColumnConfig } from 'src/layout/SimpleTable/config.generated';

export const SimpleTableComponent = ({ node }: PropsFromGenericComponent<'SimpleTable'>) => {
  const nodeItem = useNodeItem(node);

  const { data: externalApi } = useExternalApi(nodeItem.data.id);
  const data: unknown = dot.pick(nodeItem.data.path, externalApi);

  if (!isArrayOfObjects(data)) {
    return (
      <ErrorList
        nodeId={node.id}
        errors={['Tabelldata må være en liste av objekter']}
      />
    );
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
        {data.length === 0 && (
          <Table.Row>
            <Table.Cell colSpan={nodeItem.columns.length}>Ingen data</Table.Cell>
          </Table.Row>
        )}
        {data.map((row) => (
          <Table.Row key={String(row)}>
            {nodeItem.columns.map((column, idx) => (
              <Table.Cell key={`${column.id}[${idx}]`}>{renderCell(column.component, row)}</Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

function renderCell(component: ColumnConfig['component'], row: Record<string, unknown>) {
  if (component.type === 'Link') {
    return (
      <Link
        href={dot.pick(component.hrefPath, row)}
        target='_blank'
      >
        {dot.pick(component.textPath, row)}
      </Link>
    );
  }

  // FIXME: what if the path does not exist and the resulting value is undefined?
  // Should we display an error, or is this a valid use case in production?
  return dot.pick(component.valuePath, row);
}

function isArrayOfObjects(data: unknown): data is Record<string, unknown>[] {
  return Array.isArray(data) && data.every((row: unknown) => !!row && typeof row === 'object' && !Array.isArray(row));
}
