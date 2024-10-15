import React from 'react';

import { Button, Table } from '@digdir/designsystemet-react';

interface Column {
  /** Header text for the column */
  header: string;
  /** Key of the data item to display in this column */
  accessor: string;
  /** Optional function to render custom cell content */
  renderCell?: (value: string, rowData: object) => React.ReactNode;
}

interface ActionButtons {
  onClick: (rowIdx: number, rowData: object) => void;
  buttonText: string;
  icon: React.ReactNode;
  color?: 'first' | 'second' | 'success' | 'danger' | undefined;
  variant?: 'tertiary' | 'primary' | 'secondary' | undefined;
}

interface DataTableProps<T> {
  /** Array of data objects to display */
  data: T[];
  /** Configuration for table columns */
  columns: Column[];
  actionButtons?: ActionButtons[];
}

/**
 * Generic DataTable component to display tabular data.
 *
 * @param data - Array of data objects.
 * @param columns - Configuration for table columns.

 */
export function AppTable<T extends object>({ data, columns, actionButtons }: DataTableProps<T>) {
  return (
    <Table
      size='md'
      style={{
        width: '100%',
      }}
    >
      <Table.Head>
        <Table.Row>
          {columns.map((col, index) => (
            <Table.HeaderCell key={index}>{col.header}</Table.HeaderCell>
          ))}

          {actionButtons && actionButtons?.length > 0 && <Table.HeaderCell />}
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {data.map((rowData, rowIndex) => (
          <Table.Row key={rowIndex}>
            {columns.map((col, colIndex) => {
              const cellValue = rowData[col.accessor];
              if (!cellValue) {
                return null;
              }

              if (col.renderCell) {
                return <Table.Cell key={colIndex}> {col.renderCell(cellValue, rowData)}</Table.Cell>;
              }
              return <Table.Cell key={colIndex}>{cellValue as React.ReactNode}</Table.Cell>;
            })}

            {actionButtons && actionButtons?.length > 0 && (
              <Table.Cell style={{ display: 'flex', justifyContent: 'end' }}>
                {actionButtons?.map((button, idx) => (
                  <Button
                    key={idx}
                    onClick={() => button.onClick(idx, rowData)}
                    size={'sm'}
                    style={{ marginRight: '5px' }}
                    variant={button.variant ? button.variant : 'tertiary'}
                    color={button.color ? button.color : 'second'}
                  >
                    {button.buttonText}
                    {button.icon}
                  </Button>
                ))}
              </Table.Cell>
            )}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
