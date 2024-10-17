import React from 'react';

import { Delete as DeleteIcon } from '@navikt/ds-icons';

import { AppTable } from 'src/app-components/table/Table';
import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { isIDataModelReferenceArray } from 'src/layout/Table/typeguards';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type TableComponentProps = PropsFromGenericComponent<'Table'>;

type TableSummaryProps = {
  componentNode: LayoutNode<'Table'>;
};

export function TableSummary({ componentNode }: TableSummaryProps) {
  const item = useNodeItem(componentNode);
  const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');
  const { langAsString } = useLanguage();

  const data = isIDataModelReferenceArray(formData.simpleBinding) ? formData.simpleBinding : [];
  if (data.length < 1) {
    return null;
  }
  return (
    <AppTable<IDataModelReference>
      data={data}
      columns={item.columnConfig.map((config) => ({
        ...config,
        header: langAsString(config.header),
      }))}
    />
  );
}

export function TableComponent({ node }: TableComponentProps) {
  const item = useNodeItem(node);
  const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');
  const removeFromList = FD.useRemoveFromListCallback();
  const { langAsString } = useLanguage();

  console.log('formData', formData);

  const data = isIDataModelReferenceArray(formData.simpleBinding) ? formData.simpleBinding : [];

  if (data.length < 1) {
    return null;
  }

  return (
    <AppTable<IDataModelReference>
      data={data}
      columns={item.columnConfig.map((config) => ({
        ...config,
        header: langAsString(config.header),
      }))}
      actionButtons={[
        {
          onClick: (idx) => {
            removeFromList({
              startAtIndex: idx,
              reference: {
                dataType: item.dataModelBindings.simpleBinding.dataType,
                field: item.dataModelBindings.simpleBinding.field,
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
  );
}
