import React, { useState } from 'react';

import {
  Pagination,
  SortDirection,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  //TableFooter,
  TableHeader,
  TableRow,
} from '@altinn/altinn-design-system';
import type * as altinnDesignSystem from '@altinn/altinn-design-system';

import type { PropsFromGenericComponent } from '..';

import { useAppDispatch, useAppSelector, useHasChangedIgnoreUndefined } from 'src/common/hooks';
import { useGetAppListOptions } from 'src/components/hooks';
import { useDelayedSavedState } from 'src/components/hooks/useDelayedSavedState';
import { appListsActions } from 'src/shared/resources/options/appListsSlice';
import { getAppListLookupKey } from 'src/utils/applist';

import { AltinnSpinner } from 'altinn-shared/components';

export type ILayoutCompProps = PropsFromGenericComponent<'List'>;

const defaultOptions: any[] = [];
export const ListComponent = ({
  tableHeaders,
  fieldToStoreInDataModel,
  appList,
  appListId,
  mapping,
  formData,
  handleDataChange,
  sortableColumns,
}: ILayoutCompProps) => {
  const apiOptions = useGetAppListOptions({ appListId, mapping });
  const calculatedOptions = apiOptions || defaultOptions;

  const rowsPerPage = useAppSelector((state) => state.appListState.appLists[appListId || ''].size || 5);
  const currentPage = useAppSelector((state) => state.appListState.appLists[appListId || ''].pageNumber || 0);
  const totalItemsCount = useAppSelector(
    (state) => state.appListState.appLists[appListId || ''].paginationData?.totaltItemsCount || 0,
  );

  const optionsHasChanged = useHasChangedIgnoreUndefined(appList);

  const { value, setValue } = useDelayedSavedState(handleDataChange, formData?.simpleBinding, 200);

  const [selectedSort, setSelectedSort] = useState({
    idCell: '',
    sortDirection: SortDirection.NotActive,
  });

  const handleSortChange = ({ idCell, previousSortDirection }: altinnDesignSystem.SortProps) => {
    if (previousSortDirection === SortDirection.Ascending) {
      setSelectedSort({
        idCell: idCell,
        sortDirection: SortDirection.Descending,
      });
    } else {
      setSelectedSort({
        idCell: idCell,
        sortDirection: SortDirection.Ascending,
      });
    }
  };

  const fetchingOptions = useAppSelector(
    (state) => appListId && state.appListState.appLists[getAppListLookupKey({ id: appListId, mapping })]?.loading,
  );

  React.useEffect(() => {
    if (optionsHasChanged && formData.simpleBinding) {
      // New options have been loaded, we have to reset form data.
      // We also skip any required validations
      setValue(undefined, true);
    }
  }, [optionsHasChanged, formData, setValue]);

  const handleChange = ({ selectedValue }: altinnDesignSystem.ChangeProps) => {
    setValue(selectedValue);
  };

  const renderRow = (option) => {
    const cells: JSX.Element[] = [];
    for (let i = 0; i < Object.keys(option).length; i++) {
      cells.push(<TableCell key={i}>{option[Object.keys(option)[i]]}</TableCell>);
    }
    return cells;
  };

  const checkSortableColumns = (headers) => {
    const cell: JSX.Element[] = [];
    for (const header of headers) {
      if ((sortableColumns || []).includes(header)) {
        cell.push(
          <TableCell
            onChange={handleSortChange}
            id={header}
            sortDirecton={selectedSort.idCell === header ? selectedSort.sortDirection : SortDirection.NotActive}
          >
            {header}
          </TableCell>,
        );
      } else {
        cell.push(<TableCell>{header}</TableCell>);
      }
    }
    return cell;
  };

  const dispatch = useAppDispatch();

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(
      appListsActions.setPageSize({
        key: appListId || '',
        size: parseInt(event.target.value, 10),
      }),
    );
  };

  const handleChangeCurrentPage = (newPage: number) => {
    dispatch(
      appListsActions.setPageNumber({
        key: appListId || '',
        pageNumber: newPage,
      }),
    );
  };

  return (
    <>
      {fetchingOptions ? (
        <AltinnSpinner />
      ) : (
        <Table
          selectRows={true}
          onChange={handleChange}
          selectedValue={value}
        >
          <TableHeader>
            <TableRow>{checkSortableColumns(tableHeaders)}</TableRow>
          </TableHeader>
          <TableBody>
            {calculatedOptions.map((option) => {
              return (
                <TableRow
                  key={option[fieldToStoreInDataModel]}
                  value={option[fieldToStoreInDataModel]}
                >
                  {renderRow(option)}
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={tableHeaders?.length}>
                <Pagination
                  numberOfRows={totalItemsCount}
                  rowsPerPageOptions={[5, 10, 15, 20]}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  currentPage={currentPage}
                  setCurrentPage={handleChangeCurrentPage}
                  rowsPerPageText='Rader per side'
                  pageDescriptionText='av'
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </>
  );
};
