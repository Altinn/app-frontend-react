import React, { useState } from 'react';

import { Delete as DeleteIcon } from '@navikt/ds-icons';

import { AppTable } from 'src/app-components/table/Table';
import { Caption } from 'src/components/form/caption/Caption';
import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { AddToListModal } from 'src/layout/AddToList/AddToList';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { TableActionButton } from 'src/app-components/table/Table';
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
  const { title } = item.textResourceBindings ?? {};
  const { langAsString } = useLanguage();
  const isMobile = useIsMobile();

  const data = formData.simpleBinding;

  if (!Array.isArray(data)) {
    return null;
  }

  if (data.length < 1) {
    return null;
  }
  return (
    <AppTable<IDataModelReference>
      caption={title && <Caption title={<Lang id={title} />} />}
      data={data}
      columns={item.columnConfig.map((config) => ({
        ...config,
        header: langAsString(config.header),
      }))}
      mobile={isMobile}
    />
  );
}

export function TableComponent({ node }: TableComponentProps) {
  const item = useNodeItem(node);
  const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');
  const removeFromList = FD.useRemoveFromListCallback();
  const { title, description, help } = item.textResourceBindings ?? {};
  const { langAsString } = useLanguage();
  const { elementAsString } = useLanguage();
  const accessibleTitle = elementAsString(title);
  const isMobile = useIsMobile();
  const [showEdit, setShowEdit] = useState(false);

  const [editItemIndex, setEditItemIndex] = useState<number>(-1);
  const setMultiLeafValues = FD.useSetMultiLeafValues();

  const data = formData.simpleBinding;

  const actionButtons: TableActionButton[] = [];

  if (item.enableDelete) {
    actionButtons.push({
      onClick: (idx) => {
        removeFromList({
          startAtIndex: idx,
          reference: {
            dataType: item.dataModelBindings.simpleBinding.dataType,
            field: item.dataModelBindings.simpleBinding.field,
          },
          callback: (_) => true,
        });
      },
      buttonText: langAsString('general.delete'),
      icon: <DeleteIcon />,
      color: 'danger',
    });
  }

  if (!Array.isArray(data)) {
    return null;
  }

  if (data.length < 1) {
    return null;
  }

  return (
    <>
      {showEdit && editItemIndex > -1 && formData.simpleBinding && formData.simpleBinding[editItemIndex] && (
        <AddToListModal
          dataModelReference={item.dataModelBindings.simpleBinding}
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
            setEditItemIndex(-1);
            setShowEdit(false);
          }}
          onInteractOutside={() => {
            setShowEdit(false);
          }}
        />
      )}

      <AppTable<IDataModelReference>
        zebra={item.zebra}
        size={item.size}
        caption={
          title && (
            <Caption
              title={<Lang id={title} />}
              description={description && <Lang id={description} />}
              helpText={help ? { text: <Lang id={help} />, accessibleTitle } : undefined}
            />
          )
        }
        data={data}
        columns={item.columnConfig.map((config) => ({
          ...config,
          header: langAsString(config.header),
        }))}
        mobile={isMobile}
        actionButtons={actionButtons}
        actionButtonHeader={<Lang id={'general.action'} />}
      />
    </>
  );
}
