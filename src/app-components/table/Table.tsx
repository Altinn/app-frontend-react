import React from 'react';

import { Button, Table } from '@digdir/designsystemet-react';
import cn from 'classnames';
import { format, isValid, parseISO } from 'date-fns';
import { pick } from 'dot-object';

import { Caption } from 'src/app-components/table/caption/Caption';
import classes from 'src/app-components/table/Table.module.css';

interface Column {
  /** Header text for the column */
  header: string;
  /** Keys of the data item to display in this column */
  accessors: string[];
  /** Optional function to render custom cell content */
  renderCell?: (values: string[], rowData: object) => React.ReactNode;
}

interface ActionButton {
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
  title?: React.ReactNode;
  description?: React.ReactNode;
  helpText?: React.ReactNode;
  accessibleTitle?: string;
  /** Optional configuration for action buttons */
  actionButtons?: ActionButton[];
  /** Accessible header value for action buttons for screenreaders */
  actionButtonHeader?: React.ReactNode;
  /** Displays table in mobile mode */
  mobile?: boolean;
}

function formatIfDate(value: unknown): string {
  if (typeof value === 'string') {
    const parsedDate = parseISO(value);
    if (isValid(parsedDate)) {
      return format(parsedDate, 'dd.MM.yyyy');
    }
  }
  return String(value);
}

/**
 * Generic Table component to display tabular data.
 *
 * @param title
 * @param description
 * @param helpText
 * @param accessibleTitle
 * @param data - Array of data objects.
 * @param columns - Configuration for table columns.
 * @param actionButtons - Optional action button config.
 * @param mobile
 * @param actionButtonHeader
 */
export function AppTable<T extends object>({
  title,
  description,
  helpText,
  accessibleTitle,
  data,
  columns,
  actionButtons,
  mobile,
  actionButtonHeader,
}: DataTableProps<T>) {
  const defaultButtonVariant = mobile ? 'secondary' : 'tertiary';
  return (
    <Table
      size='sm'
      className={cn(classes.table, { [classes.mobileTable]: mobile })}
    >
      <Caption
        title={title}
        description={description}
        helpText={helpText ? { text: helpText, accessibleTitle } : undefined}
        required={false}
        labelSettings={undefined}
      />
      <Table.Head>
        <Table.Row>
          {columns.map((col, index) => (
            <Table.HeaderCell key={index}>{col.header}</Table.HeaderCell>
          ))}

          {actionButtons && actionButtons?.length > 0 && (
            <Table.HeaderCell>
              <span className={classes.visuallyHidden}>{actionButtonHeader}</span>
            </Table.HeaderCell>
          )}
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {data.map((rowData, rowIndex) => (
          <Table.Row key={rowIndex}>
            {columns.map((col, colIndex) => {
              const cellValues = col.accessors
                .filter((accessor) => !!pick(accessor, rowData))
                .map((accessor) => pick(accessor, rowData));
              if (cellValues.every((value) => value == null)) {
                return (
                  <Table.Cell
                    key={colIndex}
                    data-header-title={col.header}
                  >
                    -
                  </Table.Cell>
                );
              }

              if (col.renderCell) {
                return (
                  <Table.Cell
                    key={colIndex}
                    data-header-title={col.header}
                  >
                    {col.renderCell(cellValues, rowData)}
                  </Table.Cell>
                );
              }

              if (cellValues.length === 1) {
                return (
                  <Table.Cell
                    data-header-title={col.header}
                    key={colIndex}
                  >
                    {cellValues.map(formatIfDate)}
                  </Table.Cell>
                );
              }

              return (
                <Table.Cell
                  key={colIndex}
                  data-header-title={col.header}
                >
                  <ul>
                    {cellValues.map(formatIfDate).map((value, idx) => (
                      <li key={idx}>{value}</li>
                    ))}
                  </ul>
                </Table.Cell>
              );
            })}

            {actionButtons && actionButtons?.length > 0 && (
              <Table.Cell>
                <div className={classes.buttonContainer}>
                  {actionButtons?.map((button, idx) => (
                    <Button
                      key={idx}
                      onClick={() => button.onClick(rowIndex, rowData)}
                      size={'sm'}
                      variant={button.variant ? button.variant : defaultButtonVariant}
                      color={button.color ? button.color : 'second'}
                    >
                      {button.buttonText}
                      {button.icon}
                    </Button>
                  ))}
                </div>
              </Table.Cell>
            )}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
