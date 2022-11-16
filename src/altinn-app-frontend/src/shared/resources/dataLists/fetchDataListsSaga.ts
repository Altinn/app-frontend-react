import { SortDirection } from '@altinn/altinn-design-system';
import { call, fork, put, select } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { appLanguageStateSelector } from 'src/selectors/appLanguageStateSelector';
import { listStateSelector } from 'src/selectors/dataListStateSelector';
import { DataListsActions } from 'src/shared/resources/dataLists/dataListsSlice';
import { getDataListsUrl } from 'src/utils/appUrlHelper';
import { getDataListLookupKey, getDataListLookupKeys } from 'src/utils/dataList';
import { selectNotNull } from 'src/utils/sagas';
import type { IFormData } from 'src/features/form/data';
import type { ILayouts } from 'src/features/form/layout';
import type {
  IDataList,
  IDataLists,
  IDataListsMetaData,
  IFetchSpecificDataListSaga,
} from 'src/shared/resources/dataLists/index';
import type { IRepeatingGroups, IRuntimeState } from 'src/types';

import { get } from 'altinn-shared/utils';

export const formLayoutSelector = (state: IRuntimeState): ILayouts | null => state.formLayout?.layouts;
export const formDataSelector = (state: IRuntimeState) => state.formData.formData;
export const dataListsSelector = (state: IRuntimeState): IDataLists => state.dataListState.dataLists;
export const dataListsWithIndexIndicatorsSelector = (state: IRuntimeState) =>
  state.dataListState.dataListsWithIndexIndicator;
export const instanceIdSelector = (state: IRuntimeState): string | undefined => state.instanceData.instance?.id;
export const repeatingGroupsSelector = (state: IRuntimeState) => state.formLayout?.uiConfig.repeatingGroups;

export function* fetchDataListsSaga(): SagaIterator {
  const layouts: ILayouts = yield selectNotNull(formLayoutSelector);
  const repeatingGroups: IRepeatingGroups = yield selectNotNull(repeatingGroupsSelector);
  const fetchedDataLists: string[] = [];
  const dataListsWithIndexIndicators: IDataListsMetaData[] = [];
  for (const layoutId of Object.keys(layouts)) {
    for (const element of layouts[layoutId] || []) {
      if (element.type !== 'List' || !element.dataListId) {
        continue;
      }

      const { dataListId, mapping, secure } = element;

      const { keys, keyWithIndexIndicator } = getDataListLookupKeys({
        id: dataListId,
        mapping,
        secure,
        repeatingGroups,
      });
      if (keyWithIndexIndicator) {
        dataListsWithIndexIndicators.push(keyWithIndexIndicator);
      }

      if (!keys?.length) {
        continue;
      }

      for (const dataListsObject of keys) {
        const { id, mapping, secure } = dataListsObject;
        const lookupKey = getDataListLookupKey({ id, mapping });
        if (dataListId && !fetchedDataLists.includes(lookupKey)) {
          yield fork(fetchSpecificDataListSaga, {
            dataListId,
            dataMapping: mapping,
            secure,
          });
          fetchedDataLists.push(lookupKey);
        }
      }
    }
  }
  yield put(
    DataListsActions.setDataListsWithIndexIndicators({
      dataListsWithIndexIndicators,
    }),
  );
}

export function* fetchSpecificDataListSaga({
  dataListId,
  dataMapping,
  secure,
}: IFetchSpecificDataListSaga): SagaIterator {
  const key = getDataListLookupKey({ id: dataListId, mapping: dataMapping });
  const instanceId = yield select(instanceIdSelector);
  try {
    const metaData: IDataListsMetaData = {
      id: dataListId,
      mapping: dataMapping,
      secure,
    };
    yield put(DataListsActions.fetching({ key, metaData }));
    const formData: IFormData = yield select(formDataSelector);
    const language = yield select(appLanguageStateSelector);
    const dataList = yield select(listStateSelector);

    const pageSize = dataList.dataLists[dataListId].size ? dataList.dataLists[dataListId].size.toString() : '5';
    const pageNumber = dataList.dataLists[dataListId].pageNumber
      ? dataList.dataLists[dataListId].pageNumber.toString()
      : '0';
    const sortColumn = dataList.dataLists[dataListId].sortColumn
      ? dataList.dataLists[dataListId].sortColumn.toString()
      : null;
    const sortDirection = dataList.dataLists[dataListId].sortDirection
      ? dataList.dataLists[dataListId].sortDirection.toString()
      : SortDirection.NotActive;

    const url = getDataListsUrl({
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
    });

    const dataLists: IDataList = yield call(get, url);
    yield put(
      DataListsActions.fetchFulfilled({
        key,
        dataLists: dataLists.listItems,
        metadata: dataLists._metaData,
      }),
    );
  } catch (error) {
    yield put(DataListsActions.fetchRejected({ key: key, error }));
  }
}
