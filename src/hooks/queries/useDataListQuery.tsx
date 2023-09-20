import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { DataListsActions } from 'src/features/dataLists/dataListsSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { SortDirection } from 'src/layout/List/types';
import { getDataListLookupKeys } from 'src/utils/dataList';
import { getDataListsUrl } from 'src/utils/urls/appUrlHelper';
import type { IDataListData, IDataListsMetaData } from 'src/features/dataLists';
import type { IMapping } from 'src/layout/common.generated';
import type { IRepeatingGroups } from 'src/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export type Filter = {
  pageSize: string;
  pageNumber: string;
  sortColumn: string | null;
  sortDirection: SortDirection;
};
export const useDataListQuery = (
  id: string,
  filter: Filter,
  dataListId: string,
  pagination: any,
  secure?: boolean,
  mapping?: IMapping,
  enabled?: boolean,
): UseQueryResult<IDataListData> => {
  const { fetchDataList } = useAppQueriesContext();
  const dispatch = useAppDispatch();
  const { selectedLanguage } = useLanguage();
  const formData = useAppSelector((state) => state.formData.formData);

  let { pageSize, pageNumber, sortColumn, sortDirection } = filter || {};
  const paginationDefaultValue = pagination?.default ? pagination.default : 0;
  pageSize = pageSize ? pageSize : paginationDefaultValue;
  pageNumber = pageNumber ? pageNumber.toString() : '0';
  sortColumn = sortColumn ? sortColumn.toString() : null;
  sortDirection = sortDirection ?? SortDirection.NotActive;

  const dataListsWithIndexIndicators: IDataListsMetaData[] = SetIndexIndicators(id, secure, mapping);

  return useQuery(
    [id, filter, formData.Search],
    () =>
      fetchDataList(
        getDataListsUrl({
          dataListId,
          formData,
          language: selectedLanguage,
          dataMapping: mapping,
          secure,
          instanceId: window.instanceId,
          pageSize,
          pageNumber,
          sortColumn,
          sortDirection,
        }),
      ).then((dataList) => mapResponse(dataList)),
    {
      enabled,
      onSuccess: (result) => {
        dispatch(
          DataListsActions.update({
            key: id || '',
            metaData: {
              size: parseInt(pageSize),
              pageNumber: parseInt(pageNumber),
              sortColumn,
              sortDirection,
              dataListId,
              mapping,
            },
            paginationData: {
              ...result.paginationData,
            },
          }),
        );
        dispatch(
          DataListsActions.setDataListsWithIndexIndicators({
            dataListsWithIndexIndicators,
          }),
        );
      },
      onError: (error: HttpClientError) => {
        dispatch(DataListsActions.fetchRejected({ key: id, error }));
      },
    },
  );
};

const mapResponse = (dataList: IDataListData) => {
  const { listItems, _metaData } = dataList;
  return {
    listItems,
    paginationData: _metaData,
  };
};

function SetIndexIndicators(id: string, secure: boolean | undefined, mapping: IMapping | undefined) {
  const repeatingGroups: IRepeatingGroups | null = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const { keyWithIndexIndicator } = getDataListLookupKeys({
    id,
    secure,
    repeatingGroups,
    mapping,
  });

  return keyWithIndexIndicator ? ([keyWithIndexIndicator] as IDataListsMetaData[]) : [];
}
