import React from 'react';

import { Button, Table } from '@digdir/designsystemet-react';
import Ajv from 'ajv';
import cn from 'classnames';
import { isValid, parseISO } from 'date-fns';
import { pick } from 'dot-object';
import type { JSONSchema7 } from 'json-schema';

import { FieldRenderer } from 'src/app-components/DynamicForm/DynamicForm';
import classes from 'src/app-components/table/Table.module.css';

export type FormDataValue = string | number | boolean | null | FormDataValue[] | { [key: string]: FormDataValue };

export interface FormDataObject {
  [key: string]: FormDataValue;
}

interface Column {
  header: React.ReactNode;
  accessors: string[];
  renderCell?: (values: FormDataValue[], rowData: FormDataObject) => React.ReactNode;
  enableInlineEditing?: boolean;
}

export interface TableActionButton {
  onClick: (rowIdx: number, rowData: FormDataObject) => void;
  buttonText: React.ReactNode;
  icon: React.ReactNode;
  color?: 'first' | 'second' | 'success' | 'danger';
  variant?: 'tertiary' | 'primary' | 'secondary';
}

interface DataTableProps {
  data: FormDataObject[];
  schema: JSONSchema7;
  columns: Column[];
  caption?: React.ReactNode;
  actionButtons?: TableActionButton[];
  actionButtonHeader?: React.ReactNode;
  mobile?: boolean;
  size?: 'sm' | 'md' | 'lg';
  zebra?: boolean;
}

function formatValue(value: FormDataValue): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'string') {
    const parsedDate = parseISO(value);
    if (isValid(parsedDate)) {
      console.log('parsedDate', parsedDate);
      //return format(parsedDate, 'dd.MM.yyyy');
    }
    return value;
  }
  if (value === null) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map(formatValue).join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

export function AppTable({
  caption,
  data,
  schema,
  columns,
  actionButtons,
  mobile,
  actionButtonHeader,
  size,
  zebra,
}: DataTableProps) {
  const ajv = new Ajv();

  console.log(JSON.stringify(schema, null, 2));

  // const validate = ajv.compile(schema);
  // const isValid = validate(data);
  //
  // if (!isValid) {
  //   console.error('Data validation failed:', validate.errors);
  //   return <div>Data validation error</div>;
  // }

  const defaultButtonVariant = mobile ? 'secondary' : 'tertiary';

  return (
    <Table
      size={size || 'sm'}
      className={cn(classes.table, { [classes.mobileTable]: mobile })}
      zebra={zebra}
    >
      {caption}
      <Table.Head>
        <Table.Row>
          {columns.map((col, index) => (
            <Table.HeaderCell key={index}>{col.header}</Table.HeaderCell>
          ))}
          {actionButtons && actionButtons.length > 0 && (
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
                .map((accessor) => pick(accessor, rowData) as FormDataValue)
                .filter((value) => value != null);

              // console.log('col');
              // console.log(JSON.stringify(col, null, 2));

              if (col.enableInlineEditing && col.accessors.length === 1) {
                const key = col.accessors[0];

                console.log('schema', JSON.stringify(schema, null, 2));
                //
                // console.log('key', key);

                console.log('data', JSON.stringify(data, null, 2));

                console.log('data[colIndex]', data[rowIndex]);

                console.log('colIndex', rowIndex);

                return (
                  <Table.Cell
                    key={colIndex}
                    data-header-title={col.header}
                  >
                    <FieldRenderer
                      key={`${rowIndex}-${key}`}
                      fieldKey={key}
                      // @ts-ignore
                      fieldSchema={schema.items.properties![key]}
                      formData={data[rowIndex]}
                      handleChange={(e) => {
                        console.log('change', e);
                      }}
                      schema={schema}
                    />
                  </Table.Cell>
                );

                // return <pre>{JSON.stringify(schema, null, 2)}</pre>;
              }

              if (cellValues.length === 0) {
                return (
                  <Table.Cell
                    key={colIndex}
                    data-header-title={col.header}
                  />
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
                    key={colIndex}
                    data-header-title={col.header}
                  >
                    {formatValue(cellValues[0])}
                  </Table.Cell>
                );
              }

              return (
                <Table.Cell
                  key={colIndex}
                  data-header-title={col.header}
                >
                  <ul>
                    {cellValues.map((value, idx) => (
                      <li key={idx}>{formatValue(value)}</li>
                    ))}
                  </ul>
                </Table.Cell>
              );
            })}
            {actionButtons && actionButtons.length > 0 && (
              <Table.Cell>
                <div className={classes.buttonContainer}>
                  {actionButtons.map((button, idx) => (
                    <Button
                      key={idx}
                      onClick={() => button.onClick(rowIndex, rowData)}
                      size={'sm'}
                      variant={button.variant || defaultButtonVariant}
                      color={button.color || 'second'}
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

// import React from 'react';
//
// import { Button, Table } from '@digdir/designsystemet-react';
// import cn from 'classnames';
// import { format, isValid, parseISO } from 'date-fns';
// import { pick } from 'dot-object';
//
// import classes from 'src/app-components/table/Table.module.css';
//
// interface Column {
//   /** Header text for the column */
//   header: React.ReactNode;
//   /** Keys of the data item to display in this column */
//   accessors: string[];
//   /** Optional function to render custom cell content */
//   renderCell?: (values: string[], rowData: object) => React.ReactNode;
// }
//
// export interface TableActionButton {
//   onClick: (rowIdx: number, rowData: object) => void;
//   buttonText: React.ReactNode;
//   icon: React.ReactNode;
//   color?: 'first' | 'second' | 'success' | 'danger' | undefined;
//   variant?: 'tertiary' | 'primary' | 'secondary' | undefined;
// }
//
// interface DataTableProps<T> {
//   /** Array of data objects to display */
//   data: T[];
//   /** Configuration for table columns */
//   columns: Column[];
//   caption?: React.ReactNode;
//   /** Optional configuration for action buttons */
//   actionButtons?: TableActionButton[];
//   /** Accessible header value for action buttons for screenreaders */
//   actionButtonHeader?: React.ReactNode;
//   /** Displays table in mobile mode */
//   mobile?: boolean;
//   size?: 'sm' | 'md' | 'lg';
//   zebra?: boolean;
// }
//
// function formatIfDate(value: unknown): string {
//   if (typeof value === 'string') {
//     const parsedDate = parseISO(value);
//     if (isValid(parsedDate)) {
//       return format(parsedDate, 'dd.MM.yyyy');
//     }
//   }
//   return String(value);
// }
//
// export function AppTable<T extends object>({
//   caption,
//   data,
//   columns,
//   actionButtons,
//   mobile,
//   actionButtonHeader,
//   size,
//   zebra,
// }: DataTableProps<T>) {
//   const defaultButtonVariant = mobile ? 'secondary' : 'tertiary';
//   return (
//     <Table
//       size={size || 'sm'}
//       className={cn(classes.table, { [classes.mobileTable]: mobile })}
//       zebra={zebra}
//     >
//       {caption}
//       <Table.Head>
//         <Table.Row>
//           {columns.map((col, index) => (
//             <Table.HeaderCell key={index}>{col.header}</Table.HeaderCell>
//           ))}
//
//           {actionButtons && actionButtons.length > 0 && (
//             <Table.HeaderCell>
//               <span className={classes.visuallyHidden}>{actionButtonHeader}</span>
//             </Table.HeaderCell>
//           )}
//         </Table.Row>
//       </Table.Head>
//       <Table.Body>
//         {data.map((rowData, rowIndex) => (
//           <Table.Row key={rowIndex}>
//             {columns.map((col, colIndex) => {
//               const cellValues = col.accessors
//                 .filter((accessor) => !!pick(accessor, rowData))
//                 .map((accessor) => pick(accessor, rowData));
//               if (cellValues.every((value) => value == null)) {
//                 return (
//                   <Table.Cell
//                     key={colIndex}
//                     data-header-title={col.header}
//                   />
//                 );
//               }
//
//               if (col.renderCell) {
//                 return (
//                   <Table.Cell
//                     key={colIndex}
//                     data-header-title={col.header}
//                   >
//                     {col.renderCell(cellValues, rowData)}
//                   </Table.Cell>
//                 );
//               }
//
//               if (cellValues.length === 1) {
//                 return (
//                   <Table.Cell
//                     data-header-title={col.header}
//                     key={colIndex}
//                   >
//                     {cellValues.map(formatIfDate)}
//                   </Table.Cell>
//                 );
//               }
//
//               return (
//                 <Table.Cell
//                   key={colIndex}
//                   data-header-title={col.header}
//                 >
//                   <ul>
//                     {cellValues.map(formatIfDate).map((value, idx) => (
//                       <li key={idx}>{value}</li>
//                     ))}
//                   </ul>
//                 </Table.Cell>
//               );
//             })}
//
//             {actionButtons && actionButtons.length > 0 && (
//               <Table.Cell>
//                 <div className={classes.buttonContainer}>
//                   {actionButtons?.map((button, idx) => (
//                     <Button
//                       key={idx}
//                       onClick={() => button.onClick(rowIndex, rowData)}
//                       size={'sm'}
//                       variant={button.variant ? button.variant : defaultButtonVariant}
//                       color={button.color ? button.color : 'second'}
//                     >
//                       {button.buttonText}
//                       {button.icon}
//                     </Button>
//                   ))}
//                 </div>
//               </Table.Cell>
//             )}
//           </Table.Row>
//         ))}
//       </Table.Body>
//     </Table>
//   );
// }
