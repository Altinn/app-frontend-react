import React from 'react';

import {
  Pagination,
  SortDirection,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from '@altinn/altinn-design-system';
import type { ChangeProps, SortProps } from '@altinn/altinn-design-system';

import type { PropsFromGenericComponent } from '..';

import { useAppDispatch, useAppSelector } from 'src/common/hooks';
import { useGetDataList } from 'src/components/hooks';
import { useDelayedSavedState } from 'src/components/hooks/useDelayedSavedState';
import { DataListsActions } from 'src/shared/resources/dataLists/dataListsSlice';

import { getLanguageFromKey } from 'altinn-shared/utils';

export type IListProps = PropsFromGenericComponent<'List'>;

const defaultDataList: any[] = [];

export const ListComponent = ({
  tableHeaders,
  fieldToStoreInDataModel,
  dataListId,
  mapping,
  pagination,
  formData,
  handleDataChange,
  sortableColumns,
  language,
}: IListProps) => {
  const dynamicDataList = useGetDataList({ dataListId, mapping });
  const calculatedDataList = dynamicDataList || defaultDataList;

  const rowsPerPage = useAppSelector(
    (state) => state.dataListState.dataLists[dataListId || ''].size || pagination.default,
  );
  const currentPage = useAppSelector((state) => state.dataListState.dataLists[dataListId || ''].pageNumber || 0);
  const sortColumn = useAppSelector((state) => state.dataListState.dataLists[dataListId || ''].sortColumn || null);
  const sortDirection = useAppSelector(
    (state) => state.dataListState.dataLists[dataListId || ''].sortDirection || SortDirection.NotActive,
  );
  const totalItemsCount = useAppSelector(
    (state) => state.dataListState.dataLists[dataListId || ''].paginationData?.totaltItemsCount || 0,
  );

  const { value, setValue } = useDelayedSavedState(handleDataChange, formData?.simpleBinding, 200);

  const handleChange = ({ selectedValue }: ChangeProps) => {
    setValue(selectedValue);
  };

  const renderRow = (option) => {
    const cells: JSX.Element[] = [];
    for (let i = 0; i < Object.keys(option).length; i++) {
      cells.push(
        <TableCell key={`${Object.keys(option)}_${option[Object.keys(option)[i]]}`}>
          {option[Object.keys(option)[i]]}
        </TableCell>,
      );
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
            key={header}
            sortDirecton={sortColumn === header ? sortDirection : SortDirection.NotActive}
          >
            {header}
          </TableCell>,
        );
      } else {
        cell.push(<TableCell key={header}>{header}</TableCell>);
      }
    }
    return cell;
  };

  const dispatch = useAppDispatch();

  const handleSortChange = ({ idCell, previousSortDirection }: SortProps) => {
    dispatch(
      DataListsActions.setSort({
        key: dataListId || '',
        sortColumn: idCell,
        sortDirection:
          previousSortDirection === SortDirection.Descending ? SortDirection.Ascending : SortDirection.Descending,
      }),
    );
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(
      DataListsActions.setPageSize({
        key: dataListId || '',
        size: parseInt(event.target.value, 10),
      }),
    );
  };

  const handleChangeCurrentPage = (newPage: number) => {
    dispatch(
      DataListsActions.setPageNumber({
        key: dataListId || '',
        pageNumber: newPage,
      }),
    );
  };

  return (
    <Table
      selectRows={true}
      onChange={handleChange}
      selectedValue={value}
    >
      <TableHeader>
        <TableRow>{checkSortableColumns(tableHeaders)}</TableRow>
      </TableHeader>
      <TableBody>
        {calculatedDataList.map((option) => {
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
              rowsPerPageOptions={pagination.alternatives}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              currentPage={currentPage}
              setCurrentPage={handleChangeCurrentPage}
              rowsPerPageText={getLanguageFromKey('list_component.rowsPerPage', language)}
              pageDescriptionText='av'
            />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};
