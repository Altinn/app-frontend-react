import React from 'react';

import { Table } from '@digdir/designsystemet-react';
import dot from 'dot-object';

import { Label } from 'src/components/label/Label';
import { useExternalApi } from 'src/features/externalApi/useExternalApi';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const SimpleTableComponent = ({ node }: PropsFromGenericComponent<'SimpleTable'>) => {
  const nodeItem = useNodeItem(node);

  const { data: externalApi } = useExternalApi(nodeItem.data.id);
  const data = nodeItem.data.path ? dot.pick(nodeItem.data.path, externalApi) : externalApi;

  const isValidData =
    data &&
    Array.isArray(data) &&
    data.every((row) => typeof row === 'object' && nodeItem.columns.every(({ path }) => path in row));

  if (!isValidData) {
    return <div>Invalid component</div>;
  }

  return (
    <Label
      renderLabelAs='legend'
      node={node}
      textResourceBindings={{ title: nodeItem.title }}
    >
      <Table width='100%'>
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
              {nodeItem.columns.map((column) => (
                <Table.Cell key={column.id}>{row[column.id]}</Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Label>
  );
};
