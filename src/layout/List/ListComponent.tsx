import React from 'react';

import { Pagination } from '@altinn/altinn-design-system';
import { LegacyFieldSet, ResponsiveTable } from '@digdir/design-system-react';
import type { DescriptionText } from '@altinn/altinn-design-system/dist/types/src/components/Pagination/Pagination';
import type { ChangeProps, ResponsiveTableConfig, SortProps } from '@digdir/design-system-react';

import { DataListsActions } from 'src/features/dataLists/dataListsSlice';
import { useDataListQuery } from 'src/hooks/queries/useDataListQuery';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { queryClient } from 'src/index';
import { SortDirection } from 'src/layout/List/types';
import type { IDataLists } from 'src/features/dataLists';
import type { Filter } from 'src/hooks/queries/useDataListQuery';
import type { PropsFromGenericComponent } from 'src/layout';

export type IListProps = PropsFromGenericComponent<'List'>;

const defaultDataList: any[] = [];

export const ListComponent = ({ node, formData, handleDataChange, legend }: IListProps) => {
  const { tableHeaders, id, pagination, sortableColumns, tableHeadersMobile } = node.item;
  const dataList = useAppSelector((state) => state.dataListState.dataLists[id]);
  console.log(dataList);
  const { langAsString, language } = useLanguage();
  const RenderLegend = legend;
  // const dynamicDataList = useGetDataList({ id });
  const filter = createFilter(dataList);
  console.log(filter);
  const dynamicDataListTemp = useDataListQuery(id, filter);
  console.log(dynamicDataListTemp);
  // const dynamicDataList = undefined;
  const calculatedDataList = (dataList && dataList[id]?.listItems) || defaultDataList;
  const defaultPagination = pagination ? pagination.default : 0;
  const rowsPerPage = useAppSelector((state) => state.dataListState.dataLists[id]?.size || defaultPagination);
  const currentPage = useAppSelector((state) => state.dataListState.dataLists[id]?.pageNumber || 0);

  const sortColumn = useAppSelector((state) => state.dataListState.dataLists[id]?.sortColumn || null);
  const sortDirection = useAppSelector(
    (state) => state.dataListState.dataLists[id]?.sortDirection || SortDirection.NotActive,
  );
  const totalItemsCount = useAppSelector(
    (state) => state.dataListState.dataLists[id]?.paginationData?.totaltItemsCount || 0,
  );

  const handleChange = ({ selectedValue: selectedValue }: ChangeProps<Record<string, string>>) => {
    for (const key in formData) {
      handleDataChange(selectedValue[key], { key });
    }
  };

  const tableHeadersValues = { ...tableHeaders };
  for (const key in tableHeaders) {
    tableHeadersValues[key] = langAsString(tableHeaders[key]);
  }

  const selectedRow: Record<string, string> = React.useMemo(() => {
    let matchRow: boolean[] = [];
    if (!formData || JSON.stringify(formData) === '{}') {
      return {};
    }
    for (const row of calculatedDataList) {
      for (const key in formData) {
        matchRow.push(formData[key] === row[key]);
      }
      if (!matchRow.includes(false)) {
        return row;
      }
      matchRow = [];
    }
    return {};
  }, [formData, calculatedDataList]);

  const dispatch = useAppDispatch();

  const handleSortChange = (props: SortProps & { column: string }) => {
    queryClient.invalidateQueries([id]);
    dispatch(
      DataListsActions.setSort({
        key: id || '',
        sortColumn: props.column,
        sortDirection: props.previous === SortDirection.Descending ? SortDirection.Ascending : SortDirection.Descending,
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
    queryClient.invalidateQueries([id]);
  };

  const handleChangeCurrentPage = (newPage: number) => {
    dispatch(
      DataListsActions.setPageNumber({
        key: id || '',
        pageNumber: newPage,
      }),
    );
  };
  const renderPagination = () => {
    if (pagination) {
      return (
        <Pagination
          numberOfRows={totalItemsCount}
          rowsPerPageOptions={pagination?.alternatives ? pagination?.alternatives : []}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          currentPage={currentPage}
          setCurrentPage={handleChangeCurrentPage}
          descriptionTexts={((language && language['list_component']) || {}) as unknown as DescriptionText}
        />
      );
    } else {
      return undefined;
    }
  };

  const config: ResponsiveTableConfig<Record<string, string>> = {
    rows: calculatedDataList,
    headers: tableHeadersValues,
    showColumnsMobile: tableHeadersMobile,
    columnSort: {
      onSortChange: ({ column, next, previous }) => {
        handleSortChange({ previous, next, column });
      },
      sortable: sortableColumns ? sortableColumns : [],
      currentlySortedColumn: sortColumn,
      currentDirection: sortDirection,
    },
    rowSelection: {
      onSelectionChange: (row) => handleChange({ selectedValue: row }),
      selectedValue: selectedRow,
    },
    footer: renderPagination(),
  };

  return (
    <LegacyFieldSet
      legend={<RenderLegend />}
      style={{ width: '100%' }}
    >
      <div style={{ overflow: 'auto' }}>
        <ResponsiveTable config={config}></ResponsiveTable>
      </div>
    </LegacyFieldSet>
  );
};

const createFilter = (dataList: IDataLists): Filter => {
  const { size, pageNumber, sortColumn, sortDirection } = dataList || {};
  return {
    pageSize: size,
    pageNumber,
    sortColumn,
    sortDirection,
  };
};

// import { useQuery } from '@tanstack/react-query';
// import type { UseQueryResult } from '@tanstack/react-query';

// import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
// import { useAppSelector } from 'src/hooks/useAppSelector';
// import { useLanguage } from 'src/hooks/useLanguage';
// import { getDataListsUrl } from 'src/utils/urls/appUrlHelper';
// import type { IDataList, IDataListData } from 'src/features/dataLists';
// import type { SortDirection } from 'src/layout/List/types';
// import type { IRepeatingGroups } from 'src/types';
// import type { HttpClientError } from 'src/utils/network/sharedNetworking';
// export type Filter = {
//   pageSize: string;
//   pageNumber: string;
//   sortColumn: string;
//   sortDirection: SortDirection;
// };
// export const useDataListQuery = (
//   id: string | undefined,
//   filter?: Filter,
//   enabled?: boolean,
// ): UseQueryResult<IRepeatingGroups> => {
//   const { fetchDataList } = useAppQueriesContext();
//   const langTools = useLanguage();
//   const language = langTools.selectedLanguage;
//   const { instanceId } = window;
//   const layouts = useAppSelector((state) => state.formLayout.layouts);
//   const formData = useAppSelector((state) => state.formData.formData);

//   const dataListTest = layouts
//     ? (Object.values(layouts)
//         .flatMap((layout) => layout)
//         .find((element: any) => element.id === id) as IDataListData | undefined)
//     : undefined;

//   const { dataListId, secure, mapping: dataMapping } = dataListTest || {};
//   const { pageSize, pageNumber, sortColumn, sortDirection } = filter || {};

//   return useQuery(
//     [id, filter],
//     () =>
//       fetchDataList(
//         getDataListsUrl({
//           dataListId,
//           formData,
//           language,
//           dataMapping,
//           secure,
//           instanceId,
//           pageSize,
//           pageNumber,
//           sortColumn,
//           sortDirection,
//         }),
//       ).then((dataList) => mapResponse(dataList)),
//     {
//       enabled: !!dataListTest && enabled,
//       onSuccess: () => {},
//       onError: (error: HttpClientError) => {
//         window.logError('Fetching FormData failed:\n', error);
//       },
//     },
//   );
// };

// const mapResponse = (dataList: IDataList) => {
//   const { listItems, _metaData } = dataList;
//   console.log(dataList);
//   return {
//     listItems,
//     pageSize: _metaData.pageSize,
//     rowsPerPage: _metaData.pageSize,
//     pageNumber: _metaData.pageNumber,
//     sortColumn: _metaData.sortColumn,
//     sortDirection: _metaData.sortDirection,
//     totalItemsCount: _metaData.totalItemsCount,
//   };
// };
