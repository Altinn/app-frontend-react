import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { DataListsActions } from 'src/features/dataLists/dataListsSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { SortDirection } from 'src/layout/List/types';
import { getDataListsUrl } from 'src/utils/urls/appUrlHelper';
import type { IDataListData } from 'src/features/dataLists';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';
export type Filter = {
  pageSize: string;
  pageNumber: string;
  sortColumn: string | null;
  sortDirection: SortDirection;
};
export const useDataListQuery = (
  id: string | undefined,
  filter: Filter,
  enabled?: boolean,
): UseQueryResult<IDataListData> => {
  const { fetchDataList } = useAppQueriesContext();
  const langTools = useLanguage();
  const language = langTools.selectedLanguage;
  const { instanceId } = window;
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const formData = useAppSelector((state) => state.formData.formData);
  const dispatch = useAppDispatch();
  const dataListTest = layouts
    ? (Object.values(layouts)
        .flatMap((layout) => layout)
        .find((element: any) => element.id === id) as IDataListData | undefined)
    : undefined;

  let { pageSize, pageNumber, sortColumn, sortDirection } = filter || {};

  const { dataListId, secure, mapping: dataMapping, pagination } = dataListTest || {};
  console.log(pagination.default, dataListTest);
  const paginationDefaultValue = pagination?.default ? pagination.default : 0;
  pageSize = pageSize ? pageSize : paginationDefaultValue;
  pageNumber = pageNumber ? pageNumber.toString() : '0';
  sortColumn = sortColumn ? sortColumn.toString() : null;
  sortDirection = sortDirection ?? SortDirection.NotActive;

  return useQuery(
    [id, filter],
    () =>
      fetchDataList(
        getDataListsUrl({
          dataListId,
          formData,
          language,
          dataMapping,
          secure,
          instanceId,
          pageSize,
          pageNumber,
          sortColumn,
          sortDirection,
        }),
      ).then((dataList) => mapResponse(dataList)),
    {
      enabled: !!dataListTest && enabled,
      onSuccess: (result) => {
        dispatch(
          DataListsActions.fetching({
            key: id || '',
            metaData: result.paginationData,
          }),
        );
        dispatch(
          DataListsActions.setPageSize({
            key: id || '',
            size: parseInt(pageSize),
          }),
        );
        dispatch(
          DataListsActions.setPageNumber({
            key: id || '',
            pageNumber: parseInt(pageNumber),
          }),
        );
        dispatch(
          DataListsActions.setSort({
            key: id || '',
            sortColumn: result.paginationData.sortColumn,
            sortDirection: result.paginationData.sortDirection,
          }),
        );
        dispatch(
          DataListsActions.setDataList({
            dataLists: result.listItems,
          }),
        );
        // dispatch(
        //   DataListsActions.update({
        //     key: id || '',
        //     metaData: result.paginationData,
        //     listItems: result.listItems,
        //     });
        // )
      },
      onError: (error: HttpClientError) => {
        window.logError('Fetching FormData failed:\n', error);
      },
    },
  );
};

const mapResponse = (dataList: IDataListData) => {
  const { listItems, _metaData } = dataList;
  console.log(dataList);
  return {
    listItems,
    paginationData: _metaData,
  };
};
