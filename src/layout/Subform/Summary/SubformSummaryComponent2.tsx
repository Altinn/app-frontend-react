import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Spinner, Table } from '@digdir/designsystemet-react';
import { Delete as DeleteIcon, Edit as EditIcon } from '@navikt/ds-icons';
import dot from 'dot-object';

import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useAddEntryMutation, useDeleteEntryMutation } from 'src/features/subformData/useSubformMutations';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/Subform/SubformComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { getStatefulDataModelUrl } from 'src/utils/urls/appUrlHelper';
import type { ISubformSummaryComponent } from 'src/layout/Subform/Summary/SubformSummaryComponent';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function SUMMARUSubformComponent({ targetNode }: ISubformSummaryComponent): React.JSX.Element | null {
  const {
    id,
    layoutSet,
    textResourceBindings,
    tableColumns = [],
    showAddButton = true,
    showDeleteButton = true,
  } = useNodeItem(targetNode);

  const isSubformPage = useNavigationParam('isSubformPage');
  if (isSubformPage) {
    window.logErrorOnce('Cannot use a SubformComponent component within a subform');
    throw new Error('Cannot use a SubformComponent component within a subform');
  }

  const dataType = useDataTypeFromLayoutSet(layoutSet);

  if (!dataType) {
    window.logErrorOnce(`Unable to find data type for subform with id ${id}`);
    throw new Error(`Unable to find data type for subform with id ${id}`);
  }

  const { langAsString } = useLanguage();
  const addEntryMutation = useAddEntryMutation(dataType);
  const instanceData = useStrictInstanceData();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const dataElements = instanceData.data.filter((d) => d.dataType === dataType) ?? [];
  const [subformEntries, updateSubformEntries] = useState(dataElements);

  // console.log('subformEntries', subformEntries);

  const addEntry = async () => {
    setIsAdding(true);

    try {
      const result = await addEntryMutation.mutateAsync({});
      navigate(`${targetNode.id}/${result.id}`);
    } catch {
      // NOTE: Handled by useAddEntryMutation
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <ComponentStructureWrapper node={targetNode}>
      <pre>
        {JSON.stringify(
          {
            id,
            layoutSet,
            textResourceBindings,
            tableColumns,
            showAddButton,
            showDeleteButton,
          },
          null,
          2,
        )}
      </pre>

      <pre>{JSON.stringify(subformEntries, null, 2)}</pre>
      {/*<Grid*/}
      {/*  id={targetNode.id}*/}
      {/*  container={true}*/}
      {/*  item={true}*/}
      {/*  data-componentid={targetNode.id}*/}
      {/*  data-componentbaseid={targetNode.baseId}*/}
      {/*>*/}
      {/*  <Table*/}
      {/*    id={`subform-${id}-table`}*/}
      {/*    className={classes.subformTable}*/}
      {/*  >*/}
      {/*    <Caption*/}
      {/*      id={`subform-${id}-caption`}*/}
      {/*      title={<Lang id={textResourceBindings?.title} />}*/}
      {/*      description={textResourceBindings?.description && <Lang id={textResourceBindings?.description} />}*/}
      {/*    />*/}
      {/*    {subformEntries.length > 0 && (*/}
      {/*      <>*/}
      {/*        <Table.Head id={`subform-${id}-table-body`}>*/}
      {/*          <Table.Row>*/}
      {/*            {tableColumns.length ? (*/}
      {/*              tableColumns.map((entry, index) => (*/}
      {/*                <Table.HeaderCell*/}
      {/*                  className={classes.tableCellFormatting}*/}
      {/*                  key={index}*/}
      {/*                >*/}
      {/*                  <Lang id={entry.headerContent} />*/}
      {/*                </Table.HeaderCell>*/}
      {/*              ))*/}
      {/*            ) : (*/}
      {/*              <Table.HeaderCell className={classes.tableCellFormatting}>*/}
      {/*                <Lang id={'form_filler.subform_default_header'} />*/}
      {/*              </Table.HeaderCell>*/}
      {/*            )}*/}
      {/*            <Table.HeaderCell>*/}
      {/*              <span className={classes.visuallyHidden}>*/}
      {/*                <Lang id={'general.edit'} />*/}
      {/*              </span>*/}
      {/*            </Table.HeaderCell>*/}
      {/*            {showDeleteButton && (*/}
      {/*              <Table.HeaderCell>*/}
      {/*                <span className={classes.visuallyHidden}>*/}
      {/*                  <Lang id={'general.delete'} />*/}
      {/*                </span>*/}
      {/*              </Table.HeaderCell>*/}
      {/*            )}*/}
      {/*          </Table.Row>*/}
      {/*        </Table.Head>*/}
      {/*        <Table.Body>*/}
      {/*          {subformEntries.map((dataElement, index) => (*/}
      {/*            <SubformTableRow*/}
      {/*              key={dataElement.id}*/}
      {/*              dataElement={dataElement}*/}
      {/*              targetNode={targetNode}*/}
      {/*              rowNumber={index}*/}
      {/*              showDeleteButton={showDeleteButton}*/}
      {/*              deleteEntryCallback={(d) => {*/}
      {/*                const items = subformEntries.filter((x) => x.id != d.id);*/}
      {/*                updateSubformEntries([...items]);*/}
      {/*              }}*/}
      {/*            />*/}
      {/*          ))}*/}
      {/*        </Table.Body>*/}
      {/*      </>*/}
      {/*    )}*/}
      {/*  </Table>*/}

      {/*  {showAddButton && (*/}
      {/*    <div className={classes.addButton}>*/}
      {/*      <Button*/}
      {/*        disabled={isAdding}*/}
      {/*        id={`subform-${id}-add-button`}*/}
      {/*        onClick={async () => await addEntry()}*/}
      {/*        onKeyUp={async (event: React.KeyboardEvent<HTMLButtonElement>) => {*/}
      {/*          const allowedKeys = ['enter', ' ', 'spacebar'];*/}
      {/*          if (allowedKeys.includes(event.key.toLowerCase())) {*/}
      {/*            await addEntry();*/}
      {/*          }*/}
      {/*        }}*/}
      {/*        variant='secondary'*/}
      {/*        fullWidth*/}
      {/*      >*/}
      {/*        <AddIcon*/}
      {/*          fontSize='1.5rem'*/}
      {/*          aria-hidden='true'*/}
      {/*        />*/}
      {/*        {langAsString(textResourceBindings?.addButton)}*/}
      {/*      </Button>*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</Grid>*/}
    </ComponentStructureWrapper>
  );
}

function SubformTableRow({
  dataElement,
  targetNode,
  rowNumber,
  showDeleteButton,
  deleteEntryCallback,
}: {
  dataElement: IData;
  targetNode: LayoutNode<'Subform'>;
  rowNumber: number;
  showDeleteButton: boolean;
  deleteEntryCallback: (dataElement: IData) => void;
}) {
  const id = dataElement.id;
  const { tableColumns = [] } = useNodeItem(targetNode);
  const instance = useStrictInstanceData();
  const url = getStatefulDataModelUrl(instance.id, id, true);
  const { isFetching, data, error, failureCount } = useFormDataQuery(url);
  const { langAsString } = useLanguage();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteEntryMutation = useDeleteEntryMutation(id);
  const deleteButtonText = langAsString('general.delete');
  const editButtonText = langAsString('general.edit');

  const numColumns = tableColumns.length;
  const actualColumns = showDeleteButton ? numColumns + 1 : numColumns;

  if (isFetching) {
    return (
      <Table.Row>
        <Table.Cell colSpan={actualColumns}>
          <Spinner title={langAsString('general.loading')} />
        </Table.Cell>
      </Table.Row>
    );
  } else if (error) {
    console.error(`Error loading data element ${id} from server. Gave up after ${failureCount} attempt(s).`, error);
    return (
      <Table.Row>
        <Table.Cell colSpan={actualColumns}>
          <Lang id='form_filler.error_fetch_subform' />
        </Table.Cell>
      </Table.Row>
    );
  }

  const deleteEntry = async () => {
    setIsDeleting(true);

    try {
      await deleteEntryMutation.mutateAsync(id);
      deleteEntryCallback(dataElement);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <Table.Row
      key={`subform-row-${id}`}
      data-row-num={rowNumber}
      className={isDeleting ? classes.disabledRow : ''}
    >
      {tableColumns.length ? (
        tableColumns.map((entry, index) => (
          <Table.Cell key={`subform-cell-${id}-${index}`}>
            <DataQueryWithDefaultValue
              data={data}
              query={entry.cellContent.query}
              defaultValue={entry.cellContent.default}
            />
          </Table.Cell>
        ))
      ) : (
        <Table.Cell key={`subform-cell-${id}-0`}>{String(id)}</Table.Cell>
      )}
      <Table.Cell className={classes.buttonCell}>
        <div className={classes.buttonInCellWrapper}>
          <Button
            disabled={isDeleting}
            variant='tertiary'
            color='second'
            size='small'
            onClick={async () => navigate(`${targetNode.id}/${id}`)}
            aria-label={editButtonText}
            data-testid='edit-button'
            className={classes.tableButton}
          >
            {editButtonText}
            <EditIcon
              fontSize='1rem'
              aria-hidden='true'
            />
          </Button>
        </div>
      </Table.Cell>
      {showDeleteButton && (
        <Table.Cell className={classes.buttonCell}>
          <div className={classes.buttonInCellWrapper}>
            <Button
              disabled={isDeleting}
              variant='tertiary'
              color='danger'
              size='small'
              onClick={async () => await deleteEntry()}
              aria-label={deleteButtonText}
              data-testid='delete-button'
              className={classes.tableButton}
            >
              {deleteButtonText}
              <DeleteIcon
                fontSize='1rem'
                aria-hidden='true'
              />
            </Button>
          </div>
        </Table.Cell>
      )}
    </Table.Row>
  );
}

export interface DataQueryParams {
  data: unknown;
  query: string;
  defaultValue?: string;
}

export function DataQueryWithDefaultValue(props: DataQueryParams) {
  const { data, query, defaultValue } = props;

  // console.log({ data, query, defaultValue });

  const { langAsString } = useLanguage();
  let content = dot.pick(query, data);

  if (!content && defaultValue != undefined) {
    const textLookup = langAsString(defaultValue);
    content = textLookup ? textLookup : defaultValue;
  }

  if (typeof content === 'object' || content === undefined || content === null) {
    return null;
  }

  return <>{String(content)}</>;
}

// import React, { type PropsWithChildren } from 'react';
// import { useNavigate } from 'react-router-dom';
//
// import { Spinner, Table } from '@digdir/designsystemet-react';
//
// import { useTaskStore } from 'src/core/contexts/taskStoreContext';
// import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
// import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
// import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
// import { Lang } from 'src/features/language/Lang';
// import { useLanguage } from 'src/features/language/useLanguage';
// import { usePdfModeActive } from 'src/features/pdf/PDFWrapper';
// import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
// import { DataQueryWithDefaultValue } from 'src/layout/Subform/SubformComponent';
// import { useDoOverride } from 'src/layout/Subform/SubformWrapper';
// import classes from 'src/layout/Subform/Summary/SubformSummaryComponent2.module.css';
// import { EditButton } from 'src/layout/Summary2/CommonSummaryComponents/EditButton';
// import { LayoutSetSummary } from 'src/layout/Summary2/SummaryComponent2/LayoutSetSummary';
// import { usetargetNodeItem } from 'src/utils/layout/usetargetNodeItem';
// import { getStatefulDataModelUrl } from 'src/utils/urls/appUrlHelper';
// import type { IData } from 'src/types/shared';
// import type { LayouttargetNode } from 'src/utils/layout/LayouttargetNode';
//
// export interface ISubformSummaryComponent {
//   targettargetNode: LayouttargetNode<'Subform'>;
// }
//
// export function SubformSummaryWrapper({ targetNode, children }: PropsWithChildren<{ targetNode: LayouttargetNode<'Subform'> }>) {
//   const { overriddenLayoutSetId, setTaskId, setOverriddenDataModelUuid, setOverriddenLayoutSetId, overriddenTaskId } =
//     useTaskStore((state) => ({
//       setTaskId: state.setTaskId,
//       setOverriddenDataModelUuid: state.setOverriddenDataModelUuid,
//       setOverriddenLayoutSetId: state.setOverriddenLayoutSetId,
//       overriddenTaskId: state.overriddenTaskId,
//       overriddenLayoutSetId: state.overriddenLayoutSetId,
//     }));
//
//   console.log({ overriddenTaskId, overriddenLayoutSetId });
//
//   const isDone = useDoOverride(targetNode);
//   if (!isDone) {
//     return null;
//   }
//   return <>{children}</>;
// }
//
// export function SubformSummaryComponent2({ targettargetNode }: ISubformSummaryComponent): React.JSX.Element | null {
//   const { layoutSet, id, textResourceBindings, tableColumns = [] } = usetargetNodeItem(targettargetNode);
//   const dataType = useDataTypeFromLayoutSet(layoutSet);
//   const dataElements = useStrictInstanceData().data.filter((d) => d.dataType === dataType) ?? [];
//   const mobileView = useIsMobileOrTablet();
//   const pdfModeActive = usePdfModeActive();
//
//   return (
//     <div>
//       <LayoutSetSummary pageKey={layoutSet}></LayoutSetSummary>
//     </div>
//   );
//
//   // return (
//   //   <>
//   //     <Label
//   //       targetNode={targettargetNode}
//   //       id={`subform-summary2-${id}`}
//   //       renderLabelAs='span'
//   //       weight='regular'
//   //       textResourceBindings={{ title: textResourceBindings?.title }}
//   //     />
//   //     {dataElements.length === 0 ? (
//   //       <div className={classes.emptyField}>
//   //         <Lang id={'general.empty_summary'} />
//   //       </div>
//   //     ) : (
//   //       <table
//   //         className={!mobileView ? classes.table : classes.tableMobile}
//   //         data-testid={`subform-summary-${id}-table`}
//   //       >
//   //         <thead>
//   //           <tr className={pdfModeActive ? classes.grayUnderline : classes.blueUnderline}>
//   //             {tableColumns.length ? (
//   //               tableColumns.map((entry, index) => (
//   //                 <th key={index}>
//   //                   <Lang id={entry.headerContent} />
//   //                 </th>
//   //               ))
//   //             ) : (
//   //               <th>
//   //                 <Lang id={'form_filler.subform_default_header'} />
//   //               </th>
//   //             )}
//   //             {!pdfModeActive && (
//   //               <th>
//   //                 <p className='sr-only'>
//   //                   <Lang id={'general.edit'} />
//   //                 </p>
//   //               </th>
//   //             )}
//   //           </tr>
//   //         </thead>
//   //         <tbody className={classes.tableBody}>
//   //           {dataElements.map((dataElement, index) => (
//   //             <SubformSummaryTableRow
//   //               key={dataElement.id}
//   //               dataElement={dataElement}
//   //               targetNode={targettargetNode}
//   //               rowNumber={index}
//   //               pdfModeActive={pdfModeActive}
//   //             />
//   //           ))}
//   //         </tbody>
//   //       </table>
//   //     )}
//   //   </>
//   // );
// }
//
// function SubformSummaryTableRow({
//   dataElement,
//   targetNode,
//   rowNumber,
//   pdfModeActive,
// }: {
//   dataElement: IData;
//   targetNode: LayouttargetNode<'Subform'>;
//   rowNumber: number;
//   pdfModeActive: boolean;
// }) {
//   const id = dataElement.id;
//   const { tableColumns = [] } = usetargetNodeItem(targetNode);
//   const item = usetargetNodeItem(targetNode);
//   const navigate = useNavigate();
//   const instance = useStrictInstanceData();
//   const url = getStatefulDataModelUrl(instance.id, id, true);
//   const { isFetching, data, error, failureCount } = useFormDataQuery(url);
//   const { langAsString } = useLanguage();
//
//   console.log('item', item);
//
//   if (isFetching) {
//     return (
//       <tr className={classes.noRowSpacing}>
//         <td colSpan={tableColumns.length}>
//           <Spinner
//             title={langAsString('general.loading')}
//             size='xs'
//           />
//         </td>
//       </tr>
//     );
//   } else if (error) {
//     console.error(`Error loading data element ${id} from server. Gave up after ${failureCount} attempt(s).`, error);
//     return (
//       <tr className={classes.noRowSpacing}>
//         <td colSpan={tableColumns.length}>
//           <Lang id='form_filler.error_fetch_subform' />
//         </td>
//       </tr>
//     );
//   }
//
//   console.log('tableColumns', tableColumns);
//
//   return (
//     <tr
//       data-row-num={rowNumber}
//       className={classes.noRowSpacing}
//     >
//       {tableColumns.length ? (
//         tableColumns.map((entry, i) => (
//           <td key={i}>
//             <DataQueryWithDefaultValue
//               key={i}
//               data={data}
//               query={entry.cellContent.query}
//               defaultValue={entry.cellContent.default}
//             />
//           </td>
//         ))
//       ) : (
//         <Table.Cell>{String(id)}</Table.Cell>
//       )}
//       {!pdfModeActive && (
//         <td>
//           <EditButton
//             className={classes.marginLeftAuto}
//             componenttargetNode={targetNode}
//             summaryComponentId={''}
//             navigationOverride={() => navigate(`${targetNode.id}/${id}`)}
//           />
//         </td>
//       )}
//     </tr>
//   );
// }
