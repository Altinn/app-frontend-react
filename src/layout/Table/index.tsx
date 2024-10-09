import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { AppTable } from 'src/app-components/table/Table';
import { TableDef } from 'src/layout/Table/config.def.generated';
import type { PropsFromGenericComponent } from 'src/layout';

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
    renderCell: (value: number) => <strong>{value}</strong>,
  },
];

export class Table extends TableDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Table'>>(
    function LayoutComponentTableRender(props, _): JSX.Element | null {
      console.log('props', props);
      return (
        <AppTable<User>
          data={data}
          columns={columns}
        />
      );
    },
  );
}
