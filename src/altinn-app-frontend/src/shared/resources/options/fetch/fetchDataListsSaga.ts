import { SortDirection } from '@altinn/altinn-design-system';
import { call, fork, put, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';

import { appLanguageStateSelector } from 'src/selectors/appLanguageStateSelector';
import { listStateSelector } from 'src/selectors/dataListStateSelector';
import { dataListsActions } from 'src/shared/resources/options/dataListsSlice';
import { getDataListsUrl } from 'src/utils/appUrlHelper';
import {
  getKeyIndex,
  getKeyWithoutIndex,
  getKeyWithoutIndexIndicators,
  replaceIndexIndicatorsWithIndexes,
} from 'src/utils/databindings';
import { getDataListLookupKey, getDataListLookupKeys } from 'src/utils/dataList';
import { selectNotNull } from 'src/utils/sagas';
import type { IFormData } from 'src/features/form/data';
import type { IUpdateFormDataFulfilled } from 'src/features/form/data/formDataTypes';
import type { ILayouts } from 'src/features/form/layout';
import type {
  IDataList,
  IDataLists,
  IDataListsMetaData,
  IFetchSpecificDataListSaga,
  IRepeatingGroups,
  IRuntimeState,
} from 'src/types';

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
    dataListsActions.setDataListsWithIndexIndicators({
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
    yield put(dataListsActions.fetching({ key, metaData }));
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
      dataListsActions.fetchFulfilled({
        key,
        dataLists: dataLists.listItems,
        metadata: dataLists._metaData,
      }),
    );
  } catch (error) {
    yield put(dataListsActions.fetchRejected({ key: key, error }));
  }
}

export function* checkIfDataListsShouldRefetchSaga({
  payload: { field },
}: PayloadAction<IUpdateFormDataFulfilled>): SagaIterator {
  const dataLists: IDataLists = yield select(dataListsSelector);
  const dataListsWithIndexIndicators = yield select(dataListsWithIndexIndicatorsSelector);
  let foundInExistingDataLists = false;
  for (const dataListKey of Object.keys(dataLists)) {
    const dataMapping = dataLists[dataListKey].mapping;
    const dataListId = dataLists[dataListKey].id;
    const secure = dataLists[dataListKey].secure;
    if (dataMapping && Object.keys(dataMapping).includes(field)) {
      foundInExistingDataLists = true;
      yield fork(fetchSpecificDataListSaga, {
        dataListId,
        dataMapping,
        secure,
      });
    }
  }

  if (foundInExistingDataLists) {
    return;
  }

  for (const dataLists of dataListsWithIndexIndicators) {
    const { mapping, id, secure } = dataLists;
    if (
      mapping &&
      Object.keys(mapping)
        .map((key) => getKeyWithoutIndexIndicators(key))
        .includes(getKeyWithoutIndex(field))
    ) {
      const keys = getKeyIndex(field);
      const newDataMapping = {};

      for (const key of Object.keys(mapping)) {
        newDataMapping[replaceIndexIndicatorsWithIndexes(key, keys)] = mapping[key];
      }
      yield fork(fetchSpecificDataListSaga, {
        dataListId: id,
        dataMapping: newDataMapping,
        secure,
      });
    }
  }
}
