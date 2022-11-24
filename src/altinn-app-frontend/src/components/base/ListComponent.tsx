import React, { useState } from 'react';

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
import { DataListsActions } from 'src/shared/resources/dataLists/dataListsSlice';

import { getLanguageFromKey } from 'altinn-shared/utils';

export type IListProps = PropsFromGenericComponent<'List'>;

const defaultDataList: any[] = [];

export const ListComponent = ({
  tableHeaders,
  id,
  mapping,
  pagination,
  formData,
  handleDataChange,
  getTextResourceAsString,
  sortableColumns,
  language,
}: IListProps) => {
  const dynamicDataList = useGetDataList({ id, mapping });
  const calculatedDataList = dynamicDataList || defaultDataList;

  const rowsPerPage = useAppSelector((state) => state.dataListState.dataLists[id || ''].size || pagination.default);
  const currentPage = useAppSelector((state) => state.dataListState.dataLists[id || ''].pageNumber || 0);
  const sortColumn = useAppSelector((state) => state.dataListState.dataLists[id || ''].sortColumn || null);
  const sortDirection = useAppSelector(
    (state) => state.dataListState.dataLists[id || ''].sortDirection || SortDirection.NotActive,
  );
  const totalItemsCount = useAppSelector(
    (state) => state.dataListState.dataLists[id || ''].paginationData?.totaltItemsCount || 0,
  );
  const [value, setValue] = useState({});
  const handleChange = ({ selectedValue }: ChangeProps) => {
    setValue(selectedValue);
    for (const key in formData) {
      handleDataChange(selectedValue[key], { key: key });
    }
  };

  const renderRow = (datalist) => {
    const cells: JSX.Element[] = [];
    for (const key of Object.keys(datalist)) {
      cells.push(<TableCell key={`${key}_${datalist[key]}`}>{datalist[key]}</TableCell>);
    }
    return cells;
  };

  const renderHeaders = (headers) => {
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
            {getTextResourceAsString(header)}
          </TableCell>,
        );
      } else {
        cell.push(<TableCell key={header}>{getTextResourceAsString(header)}</TableCell>);
      }
    }
    return cell;
  };

  const dispatch = useAppDispatch();

  const handleSortChange = ({ idCell, previousSortDirection }: SortProps) => {
    dispatch(
      DataListsActions.setSort({
        key: id || '',
        sortColumn: idCell,
        sortDirection:
          previousSortDirection === SortDirection.Descending ? SortDirection.Ascending : SortDirection.Descending,
      }),
    );
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(
      DataListsActions.setPageSize({
        key: id || '',
        size: parseInt(event.target.value, 10),
      }),
    );
  };

  const handleChangeCurrentPage = (newPage: number) => {
    dispatch(
      DataListsActions.setPageNumber({
        key: id || '',
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
        <TableRow>{renderHeaders(tableHeaders)}</TableRow>
      </TableHeader>
      <TableBody>
        {calculatedDataList.map((datalist) => {
          return (
            <TableRow
              key={datalist}
              rowData={datalist}
            >
              {renderRow(datalist)}
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
