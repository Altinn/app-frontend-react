import React from 'react';

import { Button, Table } from '@digdir/designsystemet-react';
import { format, isValid, parseISO } from 'date-fns';
interface Column {
  /** Header text for the column */
  header: string;
  /** Keys of the data item to display in this column */
  accessors: string[];
  /** Optional function to render custom cell content */
  renderCell?: (values: string[], rowData: object) => React.ReactNode;
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

function formatIfDate(value: unknown): string {
  // Ensure the value is a string before attempting to parse it
  if (typeof value === 'string') {
    const parsedDate = parseISO(value);

    // Check if it's a valid date
    if (isValid(parsedDate)) {
      // Format the date as needed, e.g., "yyyy-MM-dd"
      return format(parsedDate, 'dd.MM.yyyy');
    }
  }

  // Return the original value (converted to string) if it's not a valid date
  return String(value);
}

/**
 * Generic Table component to display tabular data.
 *
 * @param data - Array of data objects.
 * @param columns - Configuration for table columns.
 * @param actionButtons - Optional action button config.
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
              // Get the values for all accessors in the current column
              const cellValues = col.accessors.map((accessor) => rowData[accessor]);

              // Optionally, you can filter out undefined or null values
              // const cellValues = col.accessors.map((accessor) => rowData[accessor]).filter(value => value != null);

              // If no values are present, you might want to render null or an empty cell
              if (cellValues.every((value) => value == null)) {
                return <Table.Cell key={colIndex}>-</Table.Cell>; // or return null;
              }

              if (col.renderCell) {
                return <Table.Cell key={colIndex}>{col.renderCell(cellValues, rowData)}</Table.Cell>;
              }

              // Default rendering: join the values with a space or any separator you prefer
              return (
                <Table.Cell key={colIndex}>
                  {cellValues.map(formatIfDate).map((value, idx) => (
                    <React.Fragment key={idx}>
                      {value}
                      {idx < cellValues.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </Table.Cell>
              );
            })}

            {actionButtons && actionButtons?.length > 0 && (
              <Table.Cell>
                {actionButtons?.map((button, idx) => (
                  <Button
                    key={idx}
                    onClick={() => button.onClick(rowIndex, rowData)}
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
