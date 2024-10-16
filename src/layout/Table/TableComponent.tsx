import React, { useState } from 'react';

import { Delete as DeleteIcon, Edit as EditIcon } from '@navikt/ds-icons';

import { AppTable } from 'src/app-components/table/Table';
import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { AddToListModal } from 'src/layout/AddToList/AddToList';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { FormDataValue } from 'src/app-components/DynamicForm/DynamicForm';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { ColumnConfig } from 'src/layout/Table/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type TableComponentProps = PropsFromGenericComponent<'Table'>;

type TableSummaryProps = {
  componentNode: LayoutNode<'Table'>;
};

function isFormDataValue(value: unknown): value is FormDataValue {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return true;
  } else if (Array.isArray(value)) {
    return value.every(isFormDataValue);
  } else if (typeof value === 'object' && value !== null) {
    return Object.values(value).every(isFormDataValue);
  } else {
    return false;
  }
}

function isFormDataValueArray(value: unknown): value is FormDataValue[] {
  return Array.isArray(value) && value.every(isFormDataValue);
}

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
  const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');
  const removeFromList = FD.useRemoveFromListCallback();

  const [showEdit, setShowEdit] = useState(false);

  const [editItemIndex, setEditItemIndex] = useState<number>(-1);
  const setMultiLeafValues = FD.useSetMultiLeafValues();
  console.log('formData', formData);

  return (
    <>
      {showEdit &&
        editItemIndex > -1 &&
        isFormDataValueArray(formData.simpleBinding) &&
        formData.simpleBinding[editItemIndex] && (
          <AddToListModal
            dataModelReference={item.dataModelBindings.simpleBinding}
            editItemIndex={editItemIndex}
            // @ts-ignore
            initialData={formData.simpleBinding[editItemIndex]}
            onChange={(formProps) => {
              const changes = Object.entries(formProps).map((entry) => ({
                reference: {
                  dataType: item.dataModelBindings.simpleBinding.dataType,
                  field: `${item.dataModelBindings.simpleBinding.field}[${editItemIndex}].${entry[0]}`,
                },
                newValue: `${entry[1]}`,
              }));
              setMultiLeafValues({ changes });
              console.log('changes', changes);
              setEditItemIndex(-1);
              setShowEdit(false);
            }}
          />
        )}

      <AppTable<IDataModelReference>
        data={formData.simpleBinding as IDataModelReference[]}
        columns={item.columnConfig as ColumnConfig[]}
        actionButtons={[
          {
            onClick: (idx, _) => {
              setEditItemIndex(idx);
              setShowEdit(true);
            },
            buttonText: 'Edit',
            icon: <EditIcon />,
            variant: 'tertiary',
            color: 'second',
          },
          {
            onClick: (idx) => {
              removeFromList({
                startAtIndex: idx,
                reference: {
                  dataType: item.dataModelBindings.simpleBinding.dataType,
                  field: `${item.dataModelBindings.simpleBinding.field}`,
                },
                callback: (item) => {
                  console.log(item);
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
    </>
  );
}
