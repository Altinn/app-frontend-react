import React from 'react';

import { Button, Table } from '@digdir/designsystemet-react';
import type { JSONSchema7Definition } from 'json-schema'; // Import your extracted function

import { FieldRenderer } from 'src/app-components/DynamicForm/DynamicForm';
import type { FormDataObject } from 'src/app-components/DynamicForm/DynamicForm';

interface Column {
  /** Header text for the column */
  header: string;
  /** Keys of the data item to display in this column */
  accessors: string[];
  /** Optional function to render custom cell content */
  renderCell?: (values: string[], rowData: object) => React.ReactNode;
  /** Schema definitions for each accessor */
  schemas?: JSONSchema7Definition[];
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
  /** Optional function to handle data change (for FieldRenderer) */
  onDataChange?: (updatedData: T[]) => void;
}

/**
 * Generic DataTable component to display tabular data.
 *
 * @param data - Array of data objects.
 * @param columns - Configuration for table columns.
 */
export function AppTable<T extends object>({ data, columns, actionButtons, onDataChange }: DataTableProps<T>) {
  // Function to handle data change from FieldRenderer
  const handleDataChange = (rowIndex: number, key: string, value: any) => {
    const updatedData = [...data];
    const updatedRow = { ...updatedData[rowIndex], [key]: value };
    updatedData[rowIndex] = updatedRow as T;
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

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

              console.log('cellValues', cellValues);

              console.log('col.schemas', col.schemas);

              // If all values are null, use FieldRenderer
              if (cellValues.every((value) => value == null)) {
                return (
                  <Table.Cell key={colIndex}>
                    {col.accessors.map((accessor, accessorIndex) => (
                      <FieldRenderer
                        key={accessorIndex}
                        fieldKey={accessor}
                        fieldSchema={col.schemas![accessorIndex]}
                        formData={rowData as FormDataObject}
                        handleChange={(key, value) => handleDataChange(rowIndex, key, value)}
                        schema={{}} // Pass an empty schema or the appropriate schema
                        renderFields={() => null} // Not needed here
                        locale='en' // Or pass the desired locale
                      />
                    ))}
                  </Table.Cell>
                );
              }

              if (col.renderCell) {
                return <Table.Cell key={colIndex}>{col.renderCell(cellValues, rowData)}</Table.Cell>;
              }

              // Default rendering: join the values with a line break or any separator you prefer
              return <Table.Cell key={colIndex}>{cellValues.join('\r\n')}</Table.Cell>;
            })}

            {actionButtons && actionButtons?.length > 0 && (
              <Table.Cell style={{ display: 'flex', justifyContent: 'end' }}>
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

// import React from 'react';
//
// import { Button, Table } from '@digdir/designsystemet-react';
//
// interface Column {
//   /** Header text for the column */
//   header: string;
//   /** Keys of the data item to display in this column */
//   accessors: string[];
//   /** Optional function to render custom cell content */
//   renderCell?: (values: string[], rowData: object) => React.ReactNode;
// }
//
// interface ActionButtons {
//   onClick: (rowIdx: number, rowData: object) => void;
//   buttonText: string;
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
//   actionButtons?: ActionButtons[];
// }
//
// /**
//  * Generic DataTable component to display tabular data.
//  *
//  * @param data - Array of data objects.
//  * @param columns - Configuration for table columns.
//  */
// export function AppTable<T extends object>({ data, columns, actionButtons }: DataTableProps<T>) {
//   return (
//     <Table
//       size='md'
//       style={{
//         width: '100%',
//       }}
//     >
//       <Table.Head>
//         <Table.Row>
//           {columns.map((col, index) => (
//             <Table.HeaderCell key={index}>{col.header}</Table.HeaderCell>
//           ))}
//
//           {actionButtons && actionButtons?.length > 0 && <Table.HeaderCell />}
//         </Table.Row>
//       </Table.Head>
//       <Table.Body>
//         {data.map((rowData, rowIndex) => (
//           <Table.Row key={rowIndex}>
//             {columns.map((col, colIndex) => {
//               // Get the values for all accessors in the current column
//               const cellValues = col.accessors.map((accessor) => rowData[accessor]);
//
//               // Optionally, you can filter out undefined or null values
//               // const cellValues = col.accessors.map((accessor) => rowData[accessor]).filter(value => value != null);
//
//               // If no values are present, you might want to render null or an empty cell
//               if (cellValues.every((value) => value == null)) {
//                 return <Table.Cell key={colIndex}>-</Table.Cell>; // or return null;
//               }
//
//               if (col.renderCell) {
//                 return <Table.Cell key={colIndex}>{col.renderCell(cellValues, rowData)}</Table.Cell>;
//               }
//
//               // Default rendering: join the values with a space or any separator you prefer
//               return <Table.Cell key={colIndex}>{cellValues.join('\r\n')}</Table.Cell>;
//             })}
//
//             {actionButtons && actionButtons?.length > 0 && (
//               <Table.Cell style={{ display: 'flex', justifyContent: 'end' }}>
//                 {actionButtons?.map((button, idx) => (
//                   <Button
//                     key={idx}
//                     onClick={() => button.onClick(rowIndex, rowData)}
//                     size={'sm'}
//                     style={{ marginRight: '5px' }}
//                     variant={button.variant ? button.variant : 'tertiary'}
//                     color={button.color ? button.color : 'second'}
//                   >
//                     {button.buttonText}
//                     {button.icon}
//                   </Button>
//                 ))}
//               </Table.Cell>
//             )}
//           </Table.Row>
//         ))}
//       </Table.Body>
//     </Table>
//   );
// }
