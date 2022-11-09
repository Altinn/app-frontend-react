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
import type * as altinnDesignSystem from '@altinn/altinn-design-system';

import type { PropsFromGenericComponent } from '..';

import { useAppDispatch, useAppSelector, useHasChangedIgnoreUndefined } from 'src/common/hooks';
import { useGetDataList } from 'src/components/hooks';
import { useDelayedSavedState } from 'src/components/hooks/useDelayedSavedState';
import { dataListsActions } from 'src/shared/resources/dataLists/dataListsSlice';

export type ILayoutCompProps = PropsFromGenericComponent<'List'>;

const defaultDataList: any[] = [];

export const ListComponent = ({
  tableHeaders,
  fieldToStoreInDataModel,
  dataList,
  dataListId,
  mapping,
  formData,
  handleDataChange,
  sortableColumns,
}: ILayoutCompProps) => {
  const dynamicDataList = useGetDataList({ dataListId, mapping });
  const calculatedDataList = dynamicDataList || defaultDataList;

  const rowsPerPage = useAppSelector((state) => state.dataListState.dataLists[dataListId || ''].size || 5);
  const currentPage = useAppSelector((state) => state.dataListState.dataLists[dataListId || ''].pageNumber || 0);
  const sortColumn = useAppSelector((state) => state.dataListState.dataLists[dataListId || ''].sortColumn || null);
  const sortDirection = useAppSelector(
    (state) => state.dataListState.dataLists[dataListId || ''].sortDirection || SortDirection.NotActive,
  );
  const totalItemsCount = useAppSelector(
    (state) => state.dataListState.dataLists[dataListId || ''].paginationData?.totaltItemsCount || 0,
  );

  const dataListHasChanged = useHasChangedIgnoreUndefined(dataList);
  const { value, setValue } = useDelayedSavedState(handleDataChange, formData?.simpleBinding, 200);

  React.useEffect(() => {
    if (dataListHasChanged && formData.simpleBinding) {
      // New datalist has been loaded, we have to reset form data.
      // We also skip any required validations
      setValue(undefined, true);
    }
  }, [dataListHasChanged, formData, setValue]);

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
            sortDirecton={sortColumn === header ? sortDirection : SortDirection.NotActive}
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

  const handleSortChange = ({ idCell, previousSortDirection }: altinnDesignSystem.SortProps) => {
    if (previousSortDirection === SortDirection.Descending) {
      dispatch(
        dataListsActions.setSort({
          key: dataListId || '',
          sortColumn: idCell,
          sortDirection: SortDirection.Ascending,
        }),
      );
    } else {
      dispatch(
        dataListsActions.setSort({
          key: dataListId || '',
          sortColumn: idCell,
          sortDirection: SortDirection.Descending,
        }),
      );
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(
      dataListsActions.setPageSize({
        key: dataListId || '',
        size: parseInt(event.target.value, 10),
      }),
    );
  };

  const handleChangeCurrentPage = (newPage: number) => {
    dispatch(
      dataListsActions.setPageNumber({
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
  );
};
