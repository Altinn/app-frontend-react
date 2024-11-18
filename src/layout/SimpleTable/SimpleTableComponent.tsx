import React, { useState } from 'react';

import { Delete as DeleteIcon, Edit as EditIcon } from '@navikt/ds-icons';

import { AppTable } from 'src/app-components/table/Table';
import { Caption } from 'src/components/form/caption/Caption';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { AddToListModal, isJSONSchema7Definition } from 'src/layout/AddToList/AddToList';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { TableActionButton } from 'src/app-components/table/Table';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type TableComponentProps = PropsFromGenericComponent<'SimpleTable'>;

type TableSummaryProps = {
  componentNode: LayoutNode<'SimpleTable'>;
};

export function TableSummary({ componentNode }: TableSummaryProps) {
  const { dataModelBindings, textResourceBindings, columns } = useNodeItem(componentNode, (item) => ({
    dataModelBindings: item.dataModelBindings,
    textResourceBindings: item.textResourceBindings,
    columns: item.columns,
  }));

  const { formData } = useDataModelBindings(dataModelBindings, 1, 'raw');
  const { title } = textResourceBindings ?? {};
  const isMobile = useIsMobile();

  const { schemaLookup } = DataModels.useFullStateRef().current;

  const schema = schemaLookup[dataModelBindings.tableData.dataType].getSchemaForPath(
    dataModelBindings.tableData.field,
  )[0];

  const data = formData.tableData;

  if (!Array.isArray(data)) {
    return null;
  }

  if (data.length < 1) {
    return null;
  }

  if (!schema?.items) {
    return null;
  }

  if (!isJSONSchema7Definition(schema?.items)) {
    return null;
  }

  return (
    <AppTable
      schema={schema}
      caption={title && <Caption title={<Lang id={title} />} />}
      data={data}
      columns={columns.map((config) => ({
        ...config,
        header: <Lang id={config.header} />,
      }))}
      mobile={isMobile}
    />
  );
}

export function SimpleTableComponent({ node }: TableComponentProps) {
  const item = useNodeItem(node);
  const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');
  const removeFromList = FD.useRemoveFromListCallback();
  const { title, description, help } = item.textResourceBindings ?? {};
  const { elementAsString } = useLanguage();
  const accessibleTitle = elementAsString(title);
  const isMobile = useIsMobile();

  const data = formData.tableData;

  const { schemaLookup } = DataModels.useFullStateRef().current;

  const [showEdit, setShowEdit] = useState(false);

  const [editItemIndex, setEditItemIndex] = useState<number>(-1);
  const setMultiLeafValues = FD.useSetMultiLeafValues();

  const schema = schemaLookup[item.dataModelBindings.tableData.dataType].getSchemaForPath(
    item.dataModelBindings.tableData.field,
  )[0];

  if (!Array.isArray(data)) {
    return null;
  }

  if (data.length < 1) {
    return null;
  }

  if (!isJSONSchema7Definition(schema?.items)) {
    return null;
  }

  const actionButtons: TableActionButton[] = [];

  if (item.enableDelete) {
    actionButtons.push({
      onClick: (idx) => {
        removeFromList({
          startAtIndex: idx,
          reference: {
            dataType: item.dataModelBindings.tableData.dataType,
            field: item.dataModelBindings.tableData.field,
          },
          callback: (_) => true,
        });
      },
      buttonText: <Lang id={'general.delete'} />,
      icon: <DeleteIcon />,
      color: 'danger',
    });

    actionButtons.push({
      onClick: (idx, _) => {
        setEditItemIndex(idx);
        setShowEdit(true);
      },
      buttonText: <Lang id={'general.edit'} />,
      icon: <EditIcon />,
      variant: 'tertiary',
      color: 'second',
    });
  }

  return (
    <>
      {showEdit && editItemIndex > -1 && formData.tableData && formData.tableData[editItemIndex] && (
        <AddToListModal
          dataModelReference={item.dataModelBindings.tableData}
          initialData={formData.tableData[editItemIndex]}
          onChange={(formProps) => {
            const changes = Object.entries(formProps).map((entry) => ({
              reference: {
                dataType: item.dataModelBindings.tableData.dataType,
                field: `${item.dataModelBindings.tableData.field}[${editItemIndex}].${entry[0]}`,
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

      <AppTable
        zebra={item.zebra}
        size={item.size}
        schema={schema}
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
        columns={item.columns.map((config) => ({
          ...config,
          header: <Lang id={config.header} />,
          renderCell: config.component ? (thing) => <div>{thing}</div> : undefined,
        }))}
        mobile={isMobile}
        actionButtons={actionButtons}
        actionButtonHeader={<Lang id={'general.action'} />}
      />
    </>
  );
}
// import { Delete as DeleteIcon, Edit as EditIcon } from '@navikt/ds-icons';
//
// import { AppTable } from 'src/app-components/table/Table';
// import { FD } from 'src/features/formData/FormDataWrite';
// import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
// import { AddToListModal } from 'src/layout/AddToList/AddToList';
// import type { PropsFromGenericComponent } from 'src/layout';
//
// type TableComponentProps = PropsFromGenericComponent<'Table'>;
//
// type TableSummaryProps = {
//   componentNode: LayoutNode<'Table'>;
// };
//
// export function TableSummary({ componentNode }: TableSummaryProps) {
//   const item = useNodeItem(componentNode);
//   const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');
//   const { langAsString } = useLanguage();
//   const isMobile = useIsMobile();
//
//   const data = formData.simpleBinding as IDataModelReference[];
//   if (data.length < 1) {
//     return null;
//   }
//   return (
//     <AppTable<IDataModelReference>
//       data={data}
//       columns={item.columnConfig.map((config) => ({
//         ...config,
//         header: langAsString(config.header),
//       }))}
//       mobile={isMobile}
//     />
//   );
// }
//
// export function TableComponent({ node }: TableComponentProps) {
//   const item = useNodeItem(node);
//   const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');
//   const removeFromList = FD.useRemoveFromListCallback();
//   const { langAsString } = useLanguage();
//   const isMobile = useIsMobile();
//
//   const [showEdit, setShowEdit] = useState(false);
//
//   const [editItemIndex, setEditItemIndex] = useState<number>(-1);
//   const setMultiLeafValues = FD.useSetMultiLeafValues();
//
//   const data = formData.simpleBinding as IDataModelReference[];
//   if (data.length < 1) {
//     return null;
//   }
//
//   return (
//     <>
//       {showEdit && editItemIndex > -1 && formData.simpleBinding && formData.simpleBinding[editItemIndex] && (
//         <AddToListModal
//           dataModelReference={item.dataModelBindings.simpleBinding}
//           initialData={formData.simpleBinding[editItemIndex]}
//           onChange={(formProps) => {
//             const changes = Object.entries(formProps).map((entry) => ({
//               reference: {
//                 dataType: item.dataModelBindings.simpleBinding.dataType,
//                 field: `${item.dataModelBindings.simpleBinding.field}[${editItemIndex}].${entry[0]}`,
//               },
//               newValue: `${entry[1]}`,
//             }));
//             setMultiLeafValues({ changes });
//             setEditItemIndex(-1);
//             setShowEdit(false);
//           }}
//           onInteractOutside={() => {
//             setShowEdit(false);
//           }}
//         />
//       )}
//
//       <AppTable<IDataModelReference>
//         data={data}
//         columns={item.columnConfig.map((config) => ({
//           ...config,
//           header: langAsString(config.header),
//         }))}
//         mobile={isMobile}
//         actionButtons={[
//           {
//             onClick: (idx) => {
//               removeFromList({
//                 startAtIndex: idx,
//                 reference: {
//                   dataType: item.dataModelBindings.simpleBinding.dataType,
//                   field: item.dataModelBindings.simpleBinding.field,
//                 },
//                 callback: (_) => true,
//               });
//             },
//             buttonText: langAsString('general.delete'),
//             icon: <DeleteIcon />,
//             color: 'danger',
//           },
//           {
//             onClick: (idx, _) => {
//               setEditItemIndex(idx);
//               setShowEdit(true);
//             },
//             buttonText: langAsString('general.edit'),
//             icon: <EditIcon />,
//             variant: 'tertiary',
//             color: 'second',
//           },
//         ]}
//         actionButtonHeader={<Lang id={'general.action'} />}
//       />
//     </>
//   );
// }
