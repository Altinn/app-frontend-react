import React from 'react';

import { Delete as DeleteIcon, Edit as EditIcon } from '@navikt/ds-icons';

import { AppTable } from 'src/app-components/table/Table';
import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { ColumnConfig } from 'src/layout/Table/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type TableComponentProps = PropsFromGenericComponent<'Table'>;

type TableSummaryProps = {
  componentNode: LayoutNode<'Table'>;
};

export function TableSummary({ componentNode }: TableSummaryProps) {
  const item = useNodeItem(componentNode);
  const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');

  return (
    <AppTable<IDataModelReference>
      data={formData.simpleBinding as IDataModelReference[]}
      columns={item.columnConfig as ColumnConfig[]}
    />
  );
}

/**
 * Generic DataTable component to display tabular data.
 *
 * @param data - Array of data objects.
 * @param columns - Configuration for table columns.
 */
export function TableComponent({ node }: TableComponentProps) {
  const item = useNodeItem(node);

  console.log('item.dataModelBindings', item.dataModelBindings);

  const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');

  const removeFromList = FD.useRemoveFromListCallback();

  return (
    <AppTable<IDataModelReference>
      data={formData.simpleBinding as IDataModelReference[]}
      columns={item.columnConfig as ColumnConfig[]}
      actionButtons={[
        {
          onClick: (idx, rowData) => {
            console.log(idx, rowData);
          },
          buttonText: 'Edit',
          icon: <EditIcon />,
          variant: 'tertiary',
          color: 'second',
        },
        {
          onClick: (idx, rowData) => {
            console.log(idx, rowData);

            console.log('formData', formData);

            // dataType: formData.simpleBinding,
            //   field: ``,

            console.log(
              JSON.stringify(
                {
                  index: idx,
                  reference: {
                    dataType: item.dataModelBindings.simpleBinding.dataType,
                    field: `${item.dataModelBindings.simpleBinding.field}/${idx}`, //item.dataModelBindings.simpleBinding.field,
                  },
                },
                null,
                2,
              ),
            );

            // removeFromList({
            //   reference: groupBinding,
            //   startAtIndex: row.index,
            //   callback: (item) => item[ALTINN_ROW_ID] === row.uuid,
            // });

            removeFromList({
              startAtIndex: idx - 1,
              reference: {
                dataType: item.dataModelBindings.simpleBinding.dataType,
                field: `${item.dataModelBindings.simpleBinding.field}`, //item.dataModelBindings.simpleBinding.field,
              },
              callback: (item) => {
                console.log(item);
                //item[ALTINN_ROW_ID] === rowData
                // return true;
                return true;
              },
            });
          },
          buttonText: 'Delete',
          icon: <DeleteIcon />,
          variant: 'tertiary',
          color: 'danger',
        },
      ]}
    />
  );
}
