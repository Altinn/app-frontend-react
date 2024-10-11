import React from 'react';

import { AppTable } from 'src/app-components/table/Table';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { ColumnConfig } from 'src/layout/Table/config.generated';

type TableComponentProps = PropsFromGenericComponent<'Table'>;

/**
 * Generic DataTable component to display tabular data.
 *
 * @param data - Array of data objects.
 * @param columns - Configuration for table columns.
 */
export function TableComponent({ node }: TableComponentProps) {
  const item = useNodeItem(node);
  const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');

  return (
    <AppTable<IDataModelReference>
      data={formData.data as IDataModelReference[]}
      columns={item.columnConfig as ColumnConfig[]}
    />
  );
}
