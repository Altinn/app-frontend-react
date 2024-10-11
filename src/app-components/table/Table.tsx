import React from 'react';

import { Table } from '@digdir/designsystemet-react';

interface Column {
  /** Header text for the column */
  header: string;
  /** Key of the data item to display in this column */
  accessor: string;
  /** Optional function to render custom cell content */
  renderCell?: (value: string, rowData: object) => React.ReactNode;
}

interface DataTableProps<T> {
  /** Array of data objects to display */
  data: T[];
  /** Configuration for table columns */
  columns: Column[];
}

/**
 * Generic DataTable component to display tabular data.
 *
 * @param data - Array of data objects.
 * @param columns - Configuration for table columns.
 */
export function AppTable<T extends object>({ data, columns }: DataTableProps<T>) {
  return (
    <Table size='md'>
      <Table.Head>
        <Table.Row>
          {columns.map((col, index) => (
            <Table.HeaderCell key={index}>{col.header}</Table.HeaderCell>
          ))}
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
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
