import React from 'react';

import { AppTable } from 'src/app-components/table/Table';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

interface Column<T> {
  /** Header text for the column */
  header: string;
  /** Key of the data item to display in this column */
  accessor: keyof T;
  /** Optional function to render custom cell content */
  renderCell?: (value: T[keyof T], rowData: T) => React.ReactNode;
}

interface DataTableProps<T> {
  /** Array of data objects to display */
  data: T[];
  /** Configuration for table columns */
  columns: Column<T>[];
}

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const data: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 30 },
  // Add more user data as needed
];

const columns = [
  { header: 'ID', accessor: 'id' as const },
  { header: 'Name', accessor: 'name' as const },
  { header: 'Email', accessor: 'email' as const },
  {
    header: 'Age',
    accessor: 'age' as const,
    renderCell: (value: number) => <button>{value}</button>,
  },
];

// export interface TableComponentProps {
//   tableNode: LayoutNode<'Table'>;
// }

type TableComponentProps = PropsFromGenericComponent<'Table'>;

/**
 * Generic DataTable component to display tabular data.
 *
 * @param data - Array of data objects.
 * @param columns - Configuration for table columns.
 */
export function TableComponent({ node }: TableComponentProps) {
  console.log('tableNode', node);
  const tableItem = useNodeItem(node);
  console.log('tableItem', tableItem);
  const { formData, setValue } = useDataModelBindings(tableItem.dataModelBindings, 100);

  console.log(formData, formData);

  return (
    <AppTable<User>
      data={data}
      columns={columns}
    />
  );
}
